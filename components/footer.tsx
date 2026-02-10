import Link from "next/link"
import { getBrand } from "@/lib/brands"
import { Shield, Mail, Phone, MapPin } from "lucide-react"

export async function Footer() {
    const brand = await getBrand()

    return (
        <footer className="bg-foreground text-background/80">
            <div className="container mx-auto px-4">
                {/* Main Footer */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-14">
                    {/* Brand Column */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <div className="font-bold text-base text-background leading-tight">Annual Report Filing</div>
                                <div className="text-[10px] font-medium text-background/50 leading-tight tracking-wide uppercase">Florida Business Compliance</div>
                            </div>
                        </div>
                        <p className="text-sm text-background/60 max-w-sm leading-relaxed">
                            Trusted by thousands of Florida businesses to handle their annual report compliance securely and on time.
                        </p>
                        <div className="flex flex-col gap-2 text-sm text-background/50">
                            <a href={`mailto:${brand.email}`} className="flex items-center gap-2 hover:text-background/80 transition-colors">
                                <Mail className="w-4 h-4" />
                                {brand.email}
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-background uppercase tracking-wider">Services</h4>
                        <nav className="flex flex-col gap-2.5">
                            <Link href="/file" className="text-sm text-background/60 hover:text-background/90 transition-colors">
                                File Annual Report
                            </Link>
                            <Link href="/dashboard" className="text-sm text-background/60 hover:text-background/90 transition-colors">
                                Check Filing Status
                            </Link>
                            <Link href="/file" className="text-sm text-background/60 hover:text-background/90 transition-colors">
                                Business Search
                            </Link>
                        </nav>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-background uppercase tracking-wider">Legal</h4>
                        <nav className="flex flex-col gap-2.5">
                            <Link href="/privacy-policy" className="text-sm text-background/60 hover:text-background/90 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-sm text-background/60 hover:text-background/90 transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/refund-policy" className="text-sm text-background/60 hover:text-background/90 transition-colors">
                                Refund Policy
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-background/10 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-background/40">
                        &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-background/40">
                        <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            256-bit SSL Encrypted
                        </span>
                        <span>|</span>
                        <span>Payments via Stripe</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
