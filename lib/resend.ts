import { Resend } from 'resend';

// Initialize Resend with the API key.
// If the key is missing (e.g. in dev), we mock the client to prevent runtime errors during email sending.
export const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : {
        emails: {
            send: async (params: any) => {
                console.log("[DEV] Mock Email Sent:", params);
                return { id: "mock_email_id", error: null };
            }
        }
    } as unknown as Resend;
