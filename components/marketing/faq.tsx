import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQ() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground">Everything you need to know about Florida Annual Reports.</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>When is the Florida Annual Report due?</AccordionTrigger>
                        <AccordionContent>
                            The Florida Annual Report is due by <strong>May 1st</strong> of every year. Late filings are subject to a mandatory $400 penalty by the state, which cannot be waived.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>What happens if I don't file?</AccordionTrigger>
                        <AccordionContent>
                            If you fail to file by the third Friday of September, your business will be administratively dissolved or revoked by the state. Reinstating a dissolved business is significantly more expensive and complex.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Can I change my Registered Agent?</AccordionTrigger>
                        <AccordionContent>
                            Yes. You can update your Registered Agent, mailing address, and officer/director information when you file your Annual Report with us.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Is my payment information secure?</AccordionTrigger>
                        <AccordionContent>
                            Absolutely. We use Stripe for payment processing, which is certified to PCI Service Provider Level 1. We do not store your credit card information on our servers.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}
