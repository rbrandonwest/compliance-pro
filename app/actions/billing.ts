"use server";

import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getPaymentReceiptUrl(sessionId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (!sessionId) return null;

    // Verify the user owns a filing with this Stripe session
    const filing = await prisma.filing.findFirst({
        where: {
            stripeSessionId: sessionId,
            userId: session.user.id,
        },
    });

    if (!filing) {
        throw new Error("Filing not found or access denied");
    }

    try {
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

        if (stripeSession.payment_intent) {
            const pi = await stripe.paymentIntents.retrieve(stripeSession.payment_intent as string);
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
