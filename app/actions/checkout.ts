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
    })),
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
 * Determines the filing year based on the current date.
 * Florida annual reports are due May 1st each year.
 * Before May 1st, we file for the current year.
 * After May 1st, the current year's report should already be filed,
 * so we target the next year.
 */
function getFilingYear(): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    const may1 = new Date(currentYear, 4, 1); // Month is 0-indexed
    return now >= may1 ? currentYear + 1 : currentYear;
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

    // 2. Ensure FiledEntity exists (links user to business)
    const entity = await prisma.filedEntity.upsert({
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

    // 3. Check for existing unpaid filing to prevent duplicates
    const existingUnpaidFiling = await prisma.filing.findFirst({
        where: {
            businessId: entity.id,
            userId,
            year: getFilingYear(),
            status: "PENDING_PAYMENT",
        }
    });

    // Reuse existing unpaid filing or create new one
    const filing = existingUnpaidFiling ?? await prisma.filing.create({
        data: {
            businessId: entity.id,
            userId,
            year: getFilingYear(),
            status: "PENDING_PAYMENT",
            payloadSnapshot: validatedPayload as object,
        }
    });

    // Update payload snapshot if reusing existing filing
    if (existingUnpaidFiling) {
        await prisma.filing.update({
            where: { id: filing.id },
            data: { payloadSnapshot: validatedPayload as object }
        });
    }

    // 4. Create Stripe Session
    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Florida Annual Report Filing Fee',
                            description: 'State mandated filing fee',
                        },
                        unit_amount: 0, // $0.00 (TESTING)
                    },
                    quantity: 1,
                },
                ...(validatedPayload.addRaService ? [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Registered Agent Service',
                                description: 'Annual Registered Agent Service (Includes waived Service Fee)',
                            },
                            unit_amount: 9900, // $99.00
                        },
                        quantity: 1,
                    }
                ] : [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Service Fee',
                                description: 'ComplianceFlow Processing',
                            },
                            unit_amount: 100, // $1.00 (TESTING)
                        },
                        quantity: 1,
                    }
                ]),
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?filed=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/file/${docId}`,
            metadata: {
                userId,
                docId,
                filingId: filing.id.toString(),
            }
        });

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
