import { Resend } from 'resend';

// Initialize Resend with the API key
// If the key is missing in dev, it might throw or just fail on send, so we can mock or warn if needed.
// For now, simple initialization is standard.
export const resend = new Resend(process.env.RESEND_API_KEY);
