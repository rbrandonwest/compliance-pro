import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/90 z-0" />

            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 opacity-10 z-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="container mx-auto px-4 relative z-10 text-center text-primary-foreground">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Secure Your Business?</h2>
                <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-2xl mx-auto">
                    Don't risk the $400 late fee or dissolution. File your Annual Report in minutes today.
                </p>
                <Link href="/file">
                    <Button size="lg" variant="secondary" className="h-16 px-12 text-xl shadow-2xl rounded-full gap-2">
                        File Now <ArrowRight className="w-6 h-6" />
                    </Button>
                </Link>
                <p className="mt-6 text-sm opacity-70">
                    Secure 256-bit Encrypted Transaction • Official Compliance Partner
                </p>
            </div>
        </section>
    );
}
