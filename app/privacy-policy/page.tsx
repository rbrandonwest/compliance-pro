import { getBrand } from "@/lib/brands"

export const metadata = {
    title: "Privacy Policy | Business Annual Report Filing",
    description: "Our privacy policy and data collection practices.",
}

export default async function PrivacyPolicy() {
    const brand = await getBrand()

    return (
        <main className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose prose-slate max-w-none">
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
                    <p className="mb-4">
                        We collect information that you provide directly to us when you use our services,
                        including when you file an annual report, contact customer support, or communicate with us.
                    </p>
                    <p className="mb-4">This information may include:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Contact information (name, email address, phone number)</li>
                        <li>Business information (entity name, document number, FEI/EIN)</li>
                        <li>Payment information (processed securely by our payment processor)</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
                    <p className="mb-4">
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Process and file your annual reports with the state</li>
                        <li>Send you transaction receipts and filing confirmations</li>
                        <li>Communicate with you about your order or our services</li>
                        <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                        <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">3. Data Security</h2>
                    <p>
                        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        All payment information is encrypted and processed by our third-party payment processor (Stripe). We do not store full credit card numbers on our servers.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">4. Cookies and Tracking</h2>
                    <p>
                        We use cookies and similar tracking technologies to track the activity on our service and hold certain information.
                        You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at: <a href={`mailto:${brand.email}`} className="text-primary hover:underline">{brand.email}</a>
                    </p>
                </section>
            </div>
        </main>
    )
}
