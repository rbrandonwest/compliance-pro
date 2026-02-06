import { getBrand } from "@/lib/brands"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const brand = await getBrand()

  const isModern = brand.id === "green"

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-primary/3 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Hero */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32">
          <div className="container mx-auto px-4 text-center max-w-5xl">
            <div className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors mb-8 bg-primary/5 text-primary border-primary/20`}>
              {isModern ? "🚀 Automated Business Annual Report Filing" : "✓ Official Compliance Partner"}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-foreground">
              {isModern ? "Florida Annual Reports," : "Secure Florida Annual Report"}
              <span className="text-primary block mt-2">
                {isModern ? "Automated & Done." : "Filing Made Simple."}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              {brand.description} Avoid penalties and maintain your corporate veil.
              {isModern ? " We use automation to file instantly." : " Secure, reliable, and compliant."}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link href="/file">
                <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full">
                  File Annual Report <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full border-2 hover:bg-muted/50">
                Check Status
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-32 bg-background relative">
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
                <div key={i} className="group p-8 rounded-3xl border bg-card hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
