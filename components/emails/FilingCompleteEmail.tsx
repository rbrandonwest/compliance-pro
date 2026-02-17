import * as React from 'react';

interface FilingCompleteEmailProps {
    companyName: string;
    year: number;
    documentNumber: string;
}

export const FilingCompleteEmail: React.FC<FilingCompleteEmailProps> = ({
    companyName,
    year,
    documentNumber,
}) => (
    <div style={{ fontFamily: 'sans-serif', lineHeight: '1.5', color: '#333' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <h2 style={{ color: '#16a34a', textAlign: 'center' }}>Your Filing is Complete!</h2>
            <p>Hello,</p>
            <p>
                Great news! The <strong>{year} Florida Annual Report</strong> for <strong>{companyName}</strong> has been successfully filed with the state.
            </p>
            <p>
                <strong>Document Number:</strong> {documentNumber}
            </p>
            <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '5px', margin: '20px 0', borderLeft: '4px solid #16a34a' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>
                    You're all set!
                </p>
                <p style={{ margin: '5px 0 0 0' }}>
                    Your business is now in compliance for {year}. You can view details and your filing history by logging into your dashboard.
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

export default FilingCompleteEmail;
