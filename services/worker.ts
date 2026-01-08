import 'dotenv/config';
import { Worker } from 'bullmq';
import { processFiling } from './automation/filer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const filingIdInt = parseInt(filingId); // Ensure it's an int if passed as string

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

            await prisma.filing.update({
                where: { id: filingIdInt },
                data: {
                    status: 'SUCCESS',
                    sunbizReceiptUrl: 'https://sunbiz.org/mock-receipt'
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
