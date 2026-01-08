import { Queue } from 'bullmq';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

declare global {
    var filingQueue: Queue | undefined;
}

// Global singleton to prevent multiple connections in dev
export const filingQueue = global.filingQueue || new Queue('filing-queue', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
});

if (process.env.NODE_ENV !== 'production') {
    global.filingQueue = filingQueue;
}
