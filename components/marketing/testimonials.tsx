import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Testimonials() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Trusted by Florida Business Owners</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of businesses who trust us to handle their compliance.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            quote: "I used to dread filing my annual report. This tool made it instant. Worth every penny for the peace of mind.",
                            author: "Sarah Jenkins",
                            role: "Owner, Miami Consulting Group",
                            initials: "SJ"
                        },
                        {
                            quote: "The automation is incredible. I received my confirmation email before I even closed the tab.",
                            author: "Michael Torres",
                            role: "Director, Orlando Tech Solutions",
                            initials: "MT"
                        },
                        {
                            quote: "Finally, a compliance tool that actually looks good and works perfectly. Highly recommended.",
                            author: "David Chen",
                            role: "Founder, Tampa Bay Ventures",
                            initials: "DC"
                        }
                    ].map((t, i) => (
                        <div key={i} className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex gap-1 mb-4 text-orange-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <blockquote className="text-lg mb-6 leading-relaxed">"{t.quote}"</blockquote>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback className="bg-primary/10 text-primary">{t.initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold">{t.author}</div>
                                    <div className="text-sm text-muted-foreground">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
