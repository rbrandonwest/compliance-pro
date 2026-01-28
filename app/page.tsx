import { getBrand } from "@/lib/brands"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const brand = await getBrand()

  const isModern = brand.id === "green"

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <main className="flex-1">
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mb-8 ${isModern ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-secondary-foreground border-transparent"}`}>
              {isModern ? "🚀 Fastest way to file" : "✓ Official Compliance Partner"}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {isModern ? "Florida Annual Reports," : "Secure Florida Annual Report"}
              <span className="text-primary block mt-2">
                {isModern ? "Automated & Done." : "Filing Made Simple."}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {brand.description} Avoid penalties and keep your business in good standing.
              {isModern ? " We use automation to file instantly." : " Secure, reliable, and compliant."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/file">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all">
                  File Annual Report <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Check Status
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: isModern ? "Instant Automation" : "Official Records",
                  desc: isModern ? "Our bots file directly with Sunbiz in seconds." : "Direct integration with state requirements.",
                  icon: isModern ? Zap : Shield
                },
                {
                  title: "Compliance Monitoring",
                  desc: "We track your status year-round.",
                  icon: CheckCircle
                },
                {
                  title: "Secure Payments",
                  desc: "Bank-level encryption for all transactions.",
                  icon: Shield
                }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl border bg-card hover:shadow-md transition-shadow">
                  <feature.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>


    </div>
  )
}
