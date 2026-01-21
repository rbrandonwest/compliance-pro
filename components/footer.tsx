import Link from "next/link"
import { getBrand } from "@/lib/brands"

export async function Footer() {
    const brand = await getBrand()

    return (
        <footer className="border-t py-8 bg-muted/30">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p className="mb-2">© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
                <div className="flex justify-center gap-6">
                    <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-primary transition-colors">
                        Terms of Service
                    </Link>
                    <Link href="/refund-policy" className="hover:text-primary transition-colors">
                        Refund Policy
                    </Link>
                </div>
            </div>
        </footer>
    )
}
