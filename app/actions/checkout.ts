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

    // 1. Ensure User exists (HandlDemo/Guest Logic from before)
    if (!userId) {
        // In the streamlined flow, they should be logged in now via registerUser
        // But if not, we fail or create a temp user? 
        // Let's assume they are logged in or we just created them.
        // For safety, let's look them up if passed in payload (rare) or error.
        console.error("No user session for checkout");
        return { success: false, error: "Authentication required" };
    }

    // 2. Fetch/Upsert Business Data (Mocking scrape result mostly for now)
    const busDoc = await prisma.businessDocument.upsert({
        where: { documentNumber: docId },
        update: {},
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
            firstOfficerTitle: "P"
        }
    });

    // 3. Create Stripe Session
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
                },
                // Add RA Service conditionally? For now hardcoded or passed via clean logic
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?filed=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/file/${docId}`,
            metadata: {
                userId: userId,
                docId: docId,
                payload: JSON.stringify(payload || {})
            }
        });

        return { success: true, url: checkoutSession.url };
    } catch (err) {
        console.error("Stripe Error:", err);
        return { success: false, error: "Payment initialization failed" };
    }
}

// Deprecated mock action - keeping for reference if needed, but renaming
export async function mockCheckoutAction(docId: string, payload: any) {
    return createCheckoutSession(docId, payload);
}
