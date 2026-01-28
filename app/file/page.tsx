import { BusinessSearch } from "./search-component"
import { CheckCircle, Shield, Clock, FileText } from "lucide-react"

export default function FilePage() {
    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-12 md:py-24 flex-1 flex flex-col items-center justify-center">

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl w-full items-center">

                    {/* Left Column: Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight mb-4">
                                File Your Florida Annual Report
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Find your business to get started. We actively monitor your status and update your records instantly with the state.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Instant Filing</h3>
                                    <p className="text-muted-foreground">Automation submits your report to Sunbiz immediately.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit">
                                    <Shield className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Secure & Compliant</h3>
                                    <p className="text-muted-foreground">Your data is encrypted and handled with bank-level security.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Automatic Updates</h3>
                                    <p className="text-muted-foreground">We pull your latest info so you don't have to re-type it.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Search Box */}
                    <div className="bg-card border rounded-2xl shadow-lg p-8 md:p-10 flex flex-col gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold mb-2">Find Your Business</h2>
                            <p className="text-muted-foreground">
                                Search by company name to locate your official Florida records.
                            </p>
                        </div>

                        <BusinessSearch />

                        <div className="text-sm text-center text-muted-foreground mt-4">
                            Not finding your business? <a href="#" className="underline hover:text-foreground">Contact Support</a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
