import { Building2, Landmark, Briefcase, Globe } from "lucide-react";

export function TrustedBy() {
    return (
        <section className="py-12 border-b bg-background/50">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
                    Trusted by forward-thinking companies across Florida
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder "Logos" using generic icons and text */}
                    <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                        <Building2 className="w-8 h-8" />
                        <span>BuildCorp</span>
                    </div>
                    <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                        <Landmark className="w-8 h-8" />
                        <span>MetroFinance</span>
                    </div>
                    <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                        <Briefcase className="w-8 h-8" />
                        <span>LegalFlow</span>
                    </div>
                    <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                        <Globe className="w-8 h-8" />
                        <span>GlobalTrade</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
