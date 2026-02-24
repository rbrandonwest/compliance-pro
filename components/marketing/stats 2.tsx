import { LucideIcon, Users, CheckCircle, Clock, Shield } from "lucide-react";

interface StatItem {
    label: string;
    value: string;
    icon: LucideIcon;
}

const stats: StatItem[] = [
    { label: "Active Businesses", value: "10,000+", icon: Users },
    { label: "Filing Success Rate", value: "99.9%", icon: CheckCircle },
    { label: "Time Saved (Hours)", value: "50,000+", icon: Clock },
    { label: "Compliance Score", value: "100%", icon: Shield },
];

export function Stats() {
    return (
        <section className="py-12 bg-primary/5 border-y border-primary/10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div className="mb-2 p-3 bg-background rounded-full shadow-sm">
                                <stat.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                            <div className="text-sm text-muted-foreground font-medium mt-1 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
