import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any, // Forcing valid type if mismatch, but let's try to match what it wants or cast
    typescript: true,
});
