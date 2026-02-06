
import 'dotenv/config';
import { resend } from '../lib/resend';
import { OrderConfirmationEmail } from '../components/emails/OrderConfirmationEmail';
import * as React from 'react';

async function sendTestEmail() {
    try {
        const email = 'delivered@resend.dev'; // Use Resend's test address or a verified domain
        console.log(`Sending test email to ${email}...`);

        const data = await resend.emails.send({
            from: 'ComplianceFlow <onboarding@resend.dev>',
            to: email,
            subject: 'TEST: Filing Received - ComplianceFlow',
            react: React.createElement(OrderConfirmationEmail, {
                companyName: 'TEST CORP LLC',
                year: 2026,
                documentNumber: 'L123456789',
            }),
        });

        console.log('Email sent successfully:', data);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

sendTestEmail();
