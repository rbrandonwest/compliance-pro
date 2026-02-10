import { getBrand } from "@/lib/brands"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { Stats } from "@/components/marketing/stats"
import { TrustedBy } from "@/components/marketing/trusted-by"
import { Testimonials } from "@/components/marketing/testimonials"
import { FAQ } from "@/components/marketing/faq"
import { CTA } from "@/components/marketing/cta"

export default async function Home() {
  const session = await getServerSession(authOptions)
  const brand = await getBrand()

  const isModern = brand.id === "green"

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-primary/3 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Hero */}
      <main className="flex-1">

        <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

              {/* Text Content */}
              <div className="flex-1 text-center lg:text-left z-10">
                <div className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors mb-8 bg-primary/5 text-primary border-primary/20`}>
                  {isModern ? "🚀 Automated Business Annual Report Filing" : "✓ Official Compliance Partner"}
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
                  {isModern ? "Florida Annual Reports," : "Secure Florida Annual Report"}
                  <span className="text-primary block mt-2">
                    {isModern ? "Automated & Done." : "Filing Made Simple."}
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {brand.description} Avoid penalties and maintain your corporate veil.
                  {isModern ? " We use automation to file instantly." : " Secure, reliable, and compliant."}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                  <Link href="/file">
                    <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full">
                      File Annual Report <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>

                  <Link href={session ? "/dashboard" : "/login"}>
                    <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50">
                      Check Status
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              <div className="flex-1 w-full max-w-xl lg:max-w-none relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/20 blur-[100px] rounded-full -z-10" />
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-primary/10 relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent z-10" />
                  <img
                    src="/hero-image.jpg"
                    alt="Business owner managing compliance"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        <TrustedBy />
        <Stats />

        {/* Features */}
        <section className="py-24 bg-background relative">
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

        <Testimonials />
        <FAQ />
        <CTA />
      </main>
    </div>
  )
}
