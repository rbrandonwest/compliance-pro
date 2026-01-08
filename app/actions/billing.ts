"use server";

import { stripe } from "@/lib/stripe";

export async function getPaymentReceiptUrl(sessionId: string) {
    if (!sessionId) return null;

    try {
        // Retrieve the session to get the payment intent or charge
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // If we have a direct receipt URL on the session (sometimes available directly or via payment_intent)
        // Usually need to go Session -> PaymentIntent -> Charge -> Receipt URL

        if (session.payment_intent) {
            const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string);
            if (pi.latest_charge) {
                const charge = await stripe.charges.retrieve(pi.latest_charge as string);
                return charge.receipt_url;
            }
        }

        return null;
    } catch (error) {
        console.error("Error fetching receipt:", error);
        return null;
    }
}
