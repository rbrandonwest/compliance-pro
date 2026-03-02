'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const checkoutPayloadSchema = z.object({
    principalAddress: z.string().min(5),
    mailingAddress: z.string().min(5),
    officers: z.array(z.object({
        name: z.string().min(1),
        title: z.string().min(1),
        address: z.string().min(5),
    })).min(1, "At least one officer is required"),
    registeredAgent: z.object({
        name: z.string().min(1),
        address: z.string().min(5),
    }),
    termsAccepted: z.literal(true),
    addRaService: z.boolean(),
    ein: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;

/**
 * Determines the filing year based on the current date in Florida's timezone.
 * Florida annual reports are due May 1st each year.
 * Before May 1st, we file for the current year.
 * After May 1st, the current year's report should already be filed,
 * so we target the next year.
 */
export async function getFilingYear(): Promise<number> {
    const now = new Date();
    const floridaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const currentYear = floridaTime.getFullYear();
    const may1 = new Date(currentYear, 4, 1);
    return floridaTime >= may1 ? currentYear + 1 : currentYear;
}

/**
 * Calculates the Unix timestamp (in seconds) for January 1st of the NEXT filing year.
 * Florida annual reports are due starting Jan 1st.
 */
async function getNextJan1stAnchor(): Promise<number> {
    const nextYear = await getFilingYear();
    const targetDate = new Date(`${nextYear + 1}-01-01T00:00:00-05:00`);
    return Math.floor(targetDate.getTime() / 1000);
}

export async function createCheckoutSession(docId: string, payload: unknown) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return { success: false, error: "Authentication required" };
    }

    // Validate payload server-side
    const parsed = checkoutPayloadSchema.safeParse(payload);
    if (!parsed.success) {
        return { success: false, error: "Invalid filing data. Please check your form and try again." };
    }
    const validatedPayload = parsed.data;

    // 1. Verify BusinessDocument exists — never create from mock data
    const busDoc = await prisma.businessDocument.findUnique({
        where: { documentNumber: docId }
    });

    if (!busDoc) {
        return { success: false, error: "Business not found. Please search for your business first." };
    }

    // Update EIN if provided by user and not already set
    const ein = validatedPayload.ein;
    if (ein && !busDoc.ein) {
        await prisma.businessDocument.update({
            where: { documentNumber: docId },
            data: { ein }
        });
    }

    const filingYear = await getFilingYear();

    const stateFeeCents = 0; // $0.00 base state fee (TESTING)
    const serviceFeeCents = 100; // $1.00 compliance service fee (TESTING)

    // 2. Use a transaction to prevent race conditions (double-click, multiple tabs, etc.)
    const filing = await prisma.$transaction(async (tx) => {
        // Ensure FiledEntity exists (links user to business)
        const entity = await tx.filedEntity.upsert({
            where: {
                userId_documentNumber: {
                    userId,
                    documentNumber: docId
                },
            },
            update: {},
            create: {
                userId,
                documentNumber: docId,
                businessName: busDoc.companyName,
                inCompliance: false
            }
        });

        // Check for ANY existing filing for this entity/year that isn't failed
        // This prevents duplicates whether the user has an unpaid, pending, processing, or completed filing
        const existingFiling = await tx.filing.findFirst({
            where: {
                businessId: entity.id,
                userId,
                year: filingYear,
                status: { notIn: ["FAILED"] },
            }
        });

        if (existingFiling) {
            // If it's an unpaid filing, reuse it (user abandoned checkout and came back)
            if (existingFiling.status === "PENDING_PAYMENT") {
                await tx.filing.update({
                    where: { id: existingFiling.id },
                    data: {
                        payloadSnapshot: {
                            ...(validatedPayload as object),
                            lockedStateFeeCents: stateFeeCents,
                            lockedServiceFeeCents: serviceFeeCents,
                        }
                    }
                });
                return existingFiling;
            }

            // Otherwise, filing is already in progress or completed — block the duplicate
            return null;
        }

        // No existing filing for this year — create a new one
        return await tx.filing.create({
            data: {
                businessId: entity.id,
                userId,
                year: filingYear,
                status: "PENDING_PAYMENT",
                payloadSnapshot: {
                    ...(validatedPayload as object),
                    lockedStateFeeCents: stateFeeCents,
                    lockedServiceFeeCents: serviceFeeCents,
                }
            }
        });
    });

    // If null, there's already a paid/in-progress filing for this year
    if (!filing) {
        return {
            success: false,
            error: `A ${filingYear} annual report filing for this business is already in progress or completed. Check your dashboard for status.`
        };
    }

    // 3. Create Stripe Session
    try {
        const isRecurring = validatedPayload.addRaService;

        const lineItems: any[] = [];

        // 1. One-time charge for TODAY's filing
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Florida Annual Report Filing Fee',
                    description: 'State mandated filing fee for the current year',
                },
                unit_amount: stateFeeCents,
            },
            quantity: 1,
        });

        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Service Fee',
                    description: 'ComplianceFlow Processing for the current year',
                },
                unit_amount: serviceFeeCents,
            },
            quantity: 1,
        });

        // 2. If recurring, add the subscription line items for NEXT year
        if (isRecurring) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Florida Annual Report Filing Fee (Annual Renewal)',
                        description: 'State mandated filing fee (Billed annually starting next January)',
                    },
                    unit_amount: stateFeeCents,
                    recurring: { interval: 'year' as const },
                },
                quantity: 1,
            });

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Service Fee (Annual Renewal)',
                        description: 'ComplianceFlow Processing (Billed annually starting next January)',
                    },
                    unit_amount: serviceFeeCents,
                    recurring: { interval: 'year' as const },
                },
                quantity: 1,
            });
        }

        const sessionOptions: any = {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: isRecurring ? 'subscription' : 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?filed=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/file/${docId}`,
            metadata: {
                userId,
                docId,
                filingId: filing.id.toString(),
            }
        };

        if (isRecurring) {
            sessionOptions.subscription_data = {
                // The trial_end delays the *recurring* line items until January 1st of next year.
                // The *one-time* line items are charged immediately today.
                trial_end: await getNextJan1stAnchor(),
                metadata: {
                    userId,
                    docId,
                    initialFilingId: filing.id.toString(),
                },
            };
        }

        const checkoutSession = await stripe.checkout.sessions.create(sessionOptions);

        // Save session ID to filing for tracking
        await prisma.filing.update({
            where: { id: filing.id },
            data: { stripeSessionId: checkoutSession.id }
        });

        return { success: true, url: checkoutSession.url };
    } catch (err) {
        console.error("Stripe checkout creation error:", err);
        return { success: false, error: "Payment initialization failed" };
    }
}
