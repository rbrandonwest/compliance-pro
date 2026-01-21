import { getBrand } from "@/lib/brands"

export const metadata = {
    title: "Terms and Conditions | Business Annual Report Filing",
    description: "Terms and conditions for using our services.",
}

export default async function TermsAndConditions() {
    const brand = await getBrand()

    return (
        <main className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>

            <div className="prose prose-slate max-w-none">
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the services provided by {brand.name}, you agree to be bound by these Terms and Conditions.
                        If you do not agree to all of these terms, do not use our services.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">2. Service Description</h2>
                    <p>
                        {brand.name} provides an automated service to assist businesses in filing their annual reports with the Florida Secretary of State (Sunbiz).
                        We act as a third-party filing agent and are not affiliated with the government.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">3. User Obligations</h2>
                    <p className="mb-4">
                        You agree to provide accurate, current, and complete information during the filing process.
                        You are responsible for safeguarding your information and for any activity that occurs under your account.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">4. Payment and Fees</h2>
                    <p className="mb-4">
                        You agree to pay all fees associated with the services you select.
                        This includes the state filing fee plus our service fee. All fees are clearly displayed before purchase.
                        By providing a payment method, you represent and warrant that you are authorized to use such payment method.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">5. Limitation of Liability</h2>
                    <p>
                        In no event shall {brand.name}, nor its directors, employees, partners, agents, suppliers, or affiliates,
                        be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation,
                        loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to use the Service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">6. Changes to Terms</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                        By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at: <a href={`mailto:${brand.email}`} className="text-primary hover:underline">{brand.email}</a>
                    </p>
                </section>
            </div>
        </main>
    )
}
