import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { filingQueue } from "@/lib/queue";

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
    } catch (err: any) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        console.log("Payment successful for session:", session.id);

        const { userId, docId, payload } = session.metadata;

        // 1. Reconstruct the logic that was previously in the mock action
        // We now do the DB writes *after* payment is confirmed.

        // Find/Create BusinessDocument (Upsert to ensure it exists)
        const busDoc = await prisma.businessDocument.upsert({
            where: { documentNumber: docId },
            update: {},
            create: {
                documentNumber: docId,
                companyName: "MOCK CORP INC", // Ideally fetched from cache or re-fetched
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

        // Find/Create FiledEntity
        const filedEntity = await prisma.filedEntity.upsert({
            where: {
                userId_documentNumber: {
                    userId: userId,
                    documentNumber: docId
                }
            },
            update: {
                businessName: busDoc.companyName,
            },
            create: {
                userId: userId,
                documentNumber: docId,
                businessName: busDoc.companyName,
                lastFiled: null, // Not filed yet
                inCompliance: false
            }
        });

        // Create Filing Record (PAID)
        const filing = await prisma.filing.create({
            data: {
                businessId: filedEntity.id,
                userId: userId,
                year: new Date().getFullYear() + 1,
                status: "PENDING", // Confirmed paid, ready for processing
                stripeSessionId: session.id, // Save Session ID for receipts
                payloadSnapshot: JSON.parse(payload || "{}")
            }
        });

        // Enqueue Job
        await filingQueue.add('filing-job', {
            filingId: filing.id,
            docId: docId,
            payload: JSON.parse(payload || "{}")
        });

        console.log(`Filing ${filing.id} created and enqueued.`);
    }

    return new Response(null, { status: 200 });
}
