import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
    console.warn("[WARN] RESEND_API_KEY is not set. Emails will be mocked and NOT actually sent.");
}

// Initialize Resend with the API key.
// If the key is missing (e.g. in dev), we mock the client to prevent runtime errors during email sending.
export const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : {
        emails: {
            send: async (params: any) => {
                console.warn("[MOCK EMAIL] RESEND_API_KEY not configured. Email NOT sent. To:", params.to, "Subject:", params.subject);
                return { data: { id: "mock_email_id" }, error: null };
            }
        }
    } as unknown as Resend;

/**
 * Helper to send an email with standardized error handling and logging.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendEmail(params: {
    to: string;
    subject: string;
    react?: React.ReactElement;
    html?: string;
    from?: string;
}) {
    const fromAddress = params.from || `Business Annual Report Filing <${process.env.EMAIL_FROM || 'noreply@businessannualreport.com'}>`;

    try {
        const result = await resend.emails.send({
            from: fromAddress,
            to: params.to,
            subject: params.subject,
            text: params.subject,
            ...(params.react ? { react: params.react } : {}),
            ...(params.html ? { html: params.html } : {}),
        } as any);

        if ((result as any).error) {
            console.error("[EMAIL ERROR] Resend returned an error:", (result as any).error);
            return false;
        }

        console.log(`[EMAIL SENT] To: ${params.to}, Subject: "${params.subject}", ID: ${(result as any).data?.id || (result as any).id}`);
        return true;
    } catch (error) {
        console.error("[EMAIL ERROR] Failed to send email:", error);
        return false;
    }
}
