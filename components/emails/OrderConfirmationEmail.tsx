
import * as React from 'react';

interface OrderConfirmationEmailProps {
    companyName: string;
    year: number;
    documentNumber: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
    companyName,
    year,
    documentNumber,
}) => (
    <div style={{ fontFamily: 'sans-serif', lineHeight: '1.5', color: '#333' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h2 style={{ color: '#0070f3', textAlign: 'center' }}>Filing Confirmation</h2>
            <p>Hello,</p>
            <p>
                Great news! We have successfully received your payment and information for <strong>{companyName}</strong>.
            </p>
            <p>
                Your <strong>{year} Florida Annual Report</strong> filing has been initiated.
            </p>
            <p>
                <strong>Document Number:</strong> {documentNumber}
            </p>
            <div style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '5px', margin: '20px 0', borderLeft: '4px solid #0070f3' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>
                    Sit back and relax!
                </p>
                <p style={{ margin: '5px 0 0 0' }}>
                    Your filing is in good hands. No further action is required from you at this time. We will notify you once the state officially accepts your report.
                </p>
            </div>
            <p>
                If you have any questions, feel free to reply to this email.
            </p>
            <p>
                Best regards,<br />
                The Business Annual Report Filing Team
            </p>
        </div>
    </div>
);

export default OrderConfirmationEmail;
