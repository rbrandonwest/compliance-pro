import 'dotenv/config';
import { Worker } from 'bullmq';
import { processFiling } from './automation/filer';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const EMAIL_FROM = `Business Annual Report Filing <${process.env.EMAIL_FROM || 'noreply@businessannualreport.com'}>`;

async function sendFilingCompleteEmail(userEmail: string, companyName: string, year: number, documentNumber: string) {
    if (!resend) {
        console.warn("[WORKER] RESEND_API_KEY not set — skipping email to", userEmail);
        return;
    }

    try {
        const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: userEmail,
            subject: `Your ${year} Annual Report Has Been Filed - ${companyName}`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #16a34a; text-align: center;">Your Filing is Complete!</h2>
                        <p>Hello,</p>
                        <p>Great news! The <strong>${year} Florida Annual Report</strong> for <strong>${companyName}</strong> has been successfully filed with the state.</p>
                        <p><strong>Document Number:</strong> ${documentNumber}</p>
                        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
                            <p style="margin: 0; font-weight: bold;">You're all set!</p>
                            <p style="margin: 5px 0 0 0;">Your business is now in compliance for ${year}. You can view details and your filing history by logging into your dashboard.</p>
                        </div>
                        <p>If you have any questions, feel free to reply to this email.</p>
                        <p>Best regards,<br />The Business Annual Report Filing Team</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error("[WORKER EMAIL ERROR]", error);
        } else {
            console.log(`[WORKER] Filing complete email sent to ${userEmail}`);
        }
    } catch (err) {
        console.error("[WORKER] Failed to send filing complete email:", err);
    }
}

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

console.log("Starting Filing Worker...");

const worker = new Worker('filing-queue', async job => {
    console.log(`Processing job ${job.id}: ${job.data.docId}`);

    // Update status to PROCESSING
    // We need to find the filing. The job.data should contain filingId.
    const { filingId, docId, payload } = job.data;
    const filingIdInt = typeof filingId === 'number' ? filingId : parseInt(filingId);

    // Check Global Automation Switch
    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'automation_enabled' }
    });

    const automationEnabled = setting?.value === 'true';

    if (!automationEnabled) {
        console.log("⚠️ Automation is DISABLED globally. Skipping execution.");
        console.log("Marking filing as MANUAL_REVIEW.");

        await prisma.filing.update({
            where: { id: filingIdInt },
            data: {
                status: "MANUAL_REVIEW",
                errorMessage: "Automation disabled. Requires manual filing."
            }
        });
        return;
    }

    await prisma.filing.update({
        where: { id: filingIdInt },
        data: { status: 'PROCESSING' }
    });

    try {
        const result = await processFiling(docId, payload);

        if (result.success) {
            console.log(`Job ${job.id} succeeded.`);

            const filing = await prisma.filing.update({
                where: { id: filingIdInt },
                data: {
                    status: 'SUCCESS',
                },
                include: {
                    user: true,
                    entity: true,
                }
            });

            // Update entity compliance
            await prisma.filedEntity.update({
                where: { id: filing.businessId },
                data: {
                    lastFiled: new Date(),
                    inCompliance: true,
                }
            });

            // Create artifact
            await prisma.artifact.create({
                data: {
                    filingId: filingIdInt,
                    type: 'SCREENSHOT',
                    path: result.screenshotPath
                }
            });

            // Send completion email
            if (filing.user.email) {
                await sendFilingCompleteEmail(
                    filing.user.email,
                    filing.entity.businessName,
                    filing.year,
                    filing.entity.documentNumber,
                );
            }
        } else {
            throw new Error(result.error);
        }
    } catch (err: any) {
        console.error(`Job ${job.id} failed:`, err);
        await prisma.filing.update({
            where: { id: filingIdInt },
            data: {
                status: 'FAILED',
                errorMessage: err.message || 'Unknown error'
            }
        });
        throw err;
    }
}, { connection });

worker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
});
