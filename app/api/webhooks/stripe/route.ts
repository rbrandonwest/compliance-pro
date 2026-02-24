import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
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

        // Idempotency Check: Protect against Stripe delivering the same event multiple times
        if (filing.status !== "PENDING_PAYMENT") {
            console.log(`[WEBHOOK] Session ${session.id} already processed. Filing is: ${filing.status}. Skipping.`);
            return new Response(null, { status: 200 });
        }

        // --- Fetch Receipt URL from Stripe ---
        let receiptUrl = null;
        try {
            if (session.invoice) {
                const invoice = await stripe.invoices.retrieve(session.invoice);
                receiptUrl = invoice.hosted_invoice_url;
            } else if (session.payment_intent) {
                const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
                if (pi.latest_charge) {
                    const charge = await stripe.charges.retrieve(pi.latest_charge as string);
                    receiptUrl = charge.receipt_url;
                }
            }
        } catch (err) {
            console.error(`[WEBHOOK] Failed to fetch receipt for session ${session.id}:`, err);
        }

        // Update filing status from PENDING_PAYMENT to PENDING (paid, ready for filer to process)
        await prisma.filing.update({
            where: { id: filingIdInt },
            data: {
                status: "PENDING",
                stripeSessionId: session.id,
                stripeReceiptUrl: receiptUrl,
            }
        });

        console.log(`Filing ${filing.id} confirmed paid and marked PENDING.`);

        // Send Confirmation Email
        const customerEmail = session.customer_details?.email || session.customer_email;
        if (customerEmail) {
            await sendEmail({
                to: customerEmail,
                subject: 'Filing Received - Business Annual Report Filing',
                react: React.createElement(OrderConfirmationEmail, {
                    companyName: filing.entity.businessName,
                    year: filing.year,
                    documentNumber: filing.entity.documentNumber,
                    receiptUrl: receiptUrl,
                }),
            });
        } else {
            console.warn(`[WEBHOOK] No customer email found for session ${session.id} — skipping confirmation email.`);
        }
    } else if (event.type === "invoice.paid") {
        const invoice = event.data.object as any;

        // Ensure this is a recurring subscription renewal, not the first payment
        // The first payment is handled by checkout.session.completed
        if (invoice.billing_reason === 'subscription_cycle') {
            console.log(`[WEBHOOK] Processing subscription renewal for invoice ${invoice.id}`);

            const subscriptionId = invoice.subscription;
            // Retrieve subscription to get original metadata (userId, docId, etc)
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            const userId = subscription.metadata.userId;
            const docId = subscription.metadata.docId;
            const initialFilingId = subscription.metadata.initialFilingId;

            if (!userId || !docId) {
                console.error(`[WEBHOOK] Missing metadata on subscription ${subscriptionId}`);
                return new Response("Missing metadata", { status: 400 });
            }

            // Find Entity to attach to
            const entity = await prisma.filedEntity.findUnique({
                where: {
                    userId_documentNumber: {
                        userId,
                        documentNumber: docId
                    }
                },
                include: { businessDoc: true }
            });

            if (!entity) {
                console.error(`[WEBHOOK] Entity not found for user ${userId}, doc ${docId}`);
                return new Response("Entity not found", { status: 404 });
            }

            // Lookup the previous filing to carry over the payload explicitly
            let payloadSnapshot = {};
            if (initialFilingId) {
                const oldFiling = await prisma.filing.findUnique({ where: { id: parseInt(initialFilingId) } });
                if (oldFiling && oldFiling.payloadSnapshot) {
                    payloadSnapshot = oldFiling.payloadSnapshot;
                }
            }

            // Determine the year of THIS current filing based on when the invoice fired
            // If it fired on Jan 1st 2025, it's for the 2025 filing year.
            const filingYear = new Date(invoice.created * 1000).getFullYear();

            // Prevent duplicates if multiple invoices trigger
            const existingFiling = await prisma.filing.findFirst({
                where: {
                    businessId: entity.id,
                    year: filingYear,
                    status: { not: "FAILED" }
                }
            });

            if (existingFiling) {
                console.log(`[WEBHOOK] Renewal filing for ${filingYear} already exists. Skipping.`);
                return new Response(null, { status: 200 });
            }

            // Create the NEW filing for the new year automatically
            // Capture the exact receipt for this specific invoice renewal
            const newFiling = await prisma.filing.create({
                data: {
                    businessId: entity.id,
                    userId,
                    year: filingYear,
                    status: "PENDING", // Ready for filer immediately
                    payloadSnapshot: payloadSnapshot,
                    invoiceNumber: invoice.number,
                    stripeReceiptUrl: invoice.hosted_invoice_url || null,
                }
            });

            console.log(`[WEBHOOK] Created new annual filing ${newFiling.id} for year ${filingYear}`);

            // Send email
            if (invoice.customer_email) {
                await sendEmail({
                    to: invoice.customer_email,
                    subject: 'Annual Renewal Received - Business Annual Report Filing',
                    react: React.createElement(OrderConfirmationEmail, {
                        companyName: entity.businessDoc.companyName,
                        year: filingYear,
                        documentNumber: docId,
                        receiptUrl: invoice.hosted_invoice_url || null,
                    }),
                });
            }
        }
    }

    return new Response(null, { status: 200 });
}
