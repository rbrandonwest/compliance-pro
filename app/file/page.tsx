import { BusinessSearch } from "./search-component"
import { CheckCircle, Shield, Clock, FileText, ArrowRight } from "lucide-react"

export default function FilePage() {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4 py-16 md:py-24 flex-1 flex flex-col items-center justify-center">

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-5xl w-full items-center">

                    {/* Left Column: Info */}
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                                <FileText className="w-4 h-4 mr-2" />
                                Florida Annual Report Filing
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
                                File Your Annual Report
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Find your business to get started. We actively monitor your status and submit your report directly to Sunbiz.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {[
                                {
                                    icon: Clock,
                                    title: "Instant Filing",
                                    desc: "Automation submits your report to Sunbiz immediately."
                                },
                                {
                                    icon: Shield,
                                    title: "Secure & Compliant",
                                    desc: "Your data is encrypted with bank-level security."
                                },
                                {
                                    icon: FileText,
                                    title: "Automatic Updates",
                                    desc: "We pull your latest info so you don't have to re-type it."
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="mt-0.5 w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                                        <item.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base mb-0.5">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Search Box */}
                    <div className="bg-card border border-border/50 rounded-2xl shadow-xl shadow-primary/5 p-8 md:p-10 flex flex-col gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold mb-2 tracking-tight">Find Your Business</h2>
                            <p className="text-muted-foreground">
                                Search by company name to locate your official Florida records.
                            </p>
                        </div>

                        <BusinessSearch />

                        <div className="text-sm text-center text-muted-foreground mt-4 space-y-2">
                            <p>
                                Not finding your business?{" "}
                                <a href="mailto:businessannualreportfiling@gmail.com" className="text-primary font-medium hover:underline">
                                    Contact Support
                                </a>
                            </p>
                            <div className="flex items-center justify-center gap-3 text-xs pt-2 border-t">
                                <span className="flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> SSL Encrypted
                                </span>
                                <span className="text-border">|</span>
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Official Records
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
