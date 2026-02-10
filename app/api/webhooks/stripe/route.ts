import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { filingQueue } from "@/lib/queue";
import { resend } from "@/lib/resend";
import OrderConfirmationEmail from "@/components/emails/OrderConfirmationEmail";
import * as React from 'react';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Webhook signature verification failed:", message);
        return new Response("Webhook signature verification failed", { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        console.log("Payment successful for session:", session.id);

        const { filingId, userId, docId } = session.metadata;

        if (!filingId) {
            console.error("Webhook missing filingId in metadata for session:", session.id);
            return new Response("Missing filingId in metadata", { status: 400 });
        }

        const filingIdInt = parseInt(filingId);

        // Look up the existing filing record created during checkout
        const filing = await prisma.filing.findUnique({
            where: { id: filingIdInt },
            include: {
                entity: {
                    include: { businessDoc: true }
                }
            }
        });

        if (!filing) {
            console.error(`Filing ${filingId} not found for session ${session.id}`);
            return new Response("Filing not found", { status: 404 });
        }

        // Update filing status from PENDING_PAYMENT to PENDING (paid, ready to process)
        await prisma.filing.update({
            where: { id: filingIdInt },
            data: {
                status: "PENDING",
                stripeSessionId: session.id,
            }
        });

        // Enqueue the automation job
        const payload = filing.payloadSnapshot || {};
        await filingQueue.add('filing-job', {
            filingId: filing.id,
            docId: filing.entity.documentNumber,
            payload,
        });

        console.log(`Filing ${filing.id} confirmed paid and enqueued.`);

        // Send Confirmation Email
        const customerEmail = session.customer_details?.email || session.customer_email;
        if (customerEmail) {
            try {
                await resend.emails.send({
                    from: `ComplianceFlow <${process.env.EMAIL_FROM || 'noreply@complianceflow.com'}>`,
                    to: customerEmail,
                    subject: 'Filing Received - ComplianceFlow',
                    react: React.createElement(OrderConfirmationEmail, {
                        companyName: filing.entity.businessName,
                        year: filing.year,
                        documentNumber: filing.entity.documentNumber,
                    }),
                });
                console.log(`Confirmation email sent to ${customerEmail}`);
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
                // Don't fail the webhook for email errors
            }
        }
    }

    return new Response(null, { status: 200 });
}
