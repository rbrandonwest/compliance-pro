'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { filingQueue } from "@/lib/queue";
import { revalidatePath } from "next/cache";

/* 
  Real Stripe Checkout Action
*/
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(docId: string, payload: any) {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // 1. Ensure User Session
    if (!userId) {
        console.error("No user session for checkout");
        return { success: false, error: "Authentication required" };
    }

    // 2. Upsert Business Document
    // Extract EIN from payload if provided
    const ein = payload?.ein;

    const busDoc = await prisma.businessDocument.upsert({
        where: { documentNumber: docId },
        update: {
            ...(ein ? { ein } : {})
        },
        create: {
            documentNumber: docId,
            companyName: "MOCK CORP INC",
            companyType: "FL Corp",
            state: "FL",
            active: true,
            dateFiled: new Date(),
            principalAddress: "123 Main St, Miami, FL 33301",
            registeredAgentName: "John Doe",
            email: "mock@example.com",
            firstOfficerName: "Jane Doe",
            firstOfficerTitle: "P",
            ein: ein || null // Use provided EIN or null
        }
    });

    // 3. Ensure FiledEntity Exists (Critical for foreign key)
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

    // 4. Create Filing Record IMMEDIATELY (Status: PENDING_PAYMENT)
    // Save the full user-submitted payload as the snapshot. This IS the truth.
    const filing = await prisma.filing.create({
        data: {
            businessId: entity.id,
            userId,
            year: 2025, // Or dynamic calculate
            status: "PENDING_PAYMENT",
            payloadSnapshot: payload as any // full form data
        }
    })

    // 5. Create Stripe Session
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
                        unit_amount: 15000, // $150.00
                    },
                    quantity: 1,
                },
                // Dynamic Line Items based on Service Selection
                ...(payload.addRaService ? [
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
                            unit_amount: 4900, // $49.00
                        },
                        quantity: 1,
                    }
                ]),
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?filed=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/file/${docId}`,
            metadata: {
                userId: userId,
                docId: docId,
                filingId: filing.id.toString(), // CRITICAL for webhook to find this record later
                // payload: JSON.stringify(payload || {}) // No longer needed in metadata since we saved it in DB
            }
        });

        // Save session ID to filing for tracking
        await prisma.filing.update({
            where: { id: filing.id },
            data: { stripeSessionId: checkoutSession.id }
        });

        return { success: true, url: checkoutSession.url };
    } catch (err) {
        console.error("Stripe Error:", err);
        return { success: false, error: "Payment initialization failed" };
    }
}


