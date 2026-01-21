import { getBrand } from "@/lib/brands"

export const metadata = {
    title: "Refund and Dispute Policy | Business Annual Report Filing",
    description: "Our refund and dispute resolution policy.",
}

export default async function RefundPolicy() {
    const brand = await getBrand()

    return (
        <main className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Refund and Dispute Policy</h1>

            <div className="prose prose-slate max-w-none">
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Refund Policy</h2>
                    <p className="mb-4">
                        At {brand.name}, we strive to provide the most efficient and reliable annual report filing service.
                        We understand that circumstances may change, and you may need to request a refund.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>
                            <strong>Before Filing:</strong> If you request a refund before your annual report has been processed and filed with the state,
                            we will issue a full refund of our service fees. State fees may be refundable depending on the status of the transaction.
                        </li>
                        <li>
                            <strong>After Filing:</strong> Once an annual report has been successfully filed with the Secretary of State,
                            we cannot refund the state filing fees as these are non-refundable by the state. However, if you are unsatisfied
                            with our service, please contact us to discuss a refund of our service fee.
                        </li>
                        <li>
                            <strong>Processing Errors:</strong> If an error occurs due to our system or a mistake on our part, we will resolve the issue
                            at no additional cost to you or provide a full refund.
                        </li>
                    </ul>
                    <p>
                        To request a refund, please contact our support team at <a href={`mailto:${brand.email}`} className="text-primary hover:underline">{brand.email}</a> with your order details.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Dispute Resolution</h2>
                    <p className="mb-4">
                        We are committed to resolving any issues or disputes amicably and efficiently.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>
                            If you have a concern or dispute regarding a charge, we encourage you to contact us directly first.
                            We can often resolve the issue faster than a bank dispute.
                        </li>
                        <li>
                            We aim to respond to all inquiries and dispute notifications within 24 business hours.
                        </li>
                        <li>
                            In the event of a formal dispute or chargeback, we will work with the payment processor to provide
                            evidence of services rendered and communication history.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                    <p>
                        If you have any questions about this policy, please contact us:
                    </p>
                    <p className="mt-2">
                        <strong>Email:</strong> {brand.email}
                    </p>
                </section>
            </div>
        </main>
    )
}
