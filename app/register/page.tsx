"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, Lock, ArrowRight, CheckCircle } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            if (res.ok) {
                router.push("/login")
            } else {
                const data = await res.json()
                setError(data.message || "Registration failed")
            }
        } catch (err) {
            setError("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md mx-4">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                            <Shield className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <div className="font-bold text-lg tracking-tight leading-tight">Annual Report Filing</div>
                            <div className="text-[10px] font-medium text-muted-foreground leading-tight tracking-wide uppercase">Florida Business Compliance</div>
                        </div>
                    </Link>
                </div>

                <Card className="shadow-xl border-border/50">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold tracking-tight">Create Your Account</CardTitle>
                        <CardDescription className="text-base">
                            Start managing your filings securely
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full h-11 text-base shadow-md shadow-primary/20" disabled={isLoading}>
                                {isLoading ? "Creating account..." : (
                                    <>Create Account <ArrowRight className="ml-2 w-4 h-4" /></>
                                )}
                            </Button>
                        </form>

                        {/* Benefits */}
                        <div className="mt-6 pt-5 border-t space-y-2.5">
                            {["Track all your filings in one place", "Get instant status notifications", "Secure, encrypted data handling"].map((benefit, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                    {benefit}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center pt-0">
                        <p className="text-sm text-muted-foreground text-center">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        256-bit SSL
                    </span>
                    <span className="text-border">|</span>
                    <span>Stripe Secured</span>
                    <span className="text-border">|</span>
                    <span>SOC 2 Compliant</span>
                </div>
            </div>
        </div>
    )
}
