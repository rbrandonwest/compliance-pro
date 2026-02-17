"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl")
    const isExisting = searchParams.get("existing") === "true"
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (res?.error) {
            setError("Invalid email or password")
            setIsLoading(false)
        } else {
            router.push(callbackUrl || "/dashboard")
            router.refresh()
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] -z-10" />

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
                        <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                        <CardDescription className="text-base">
                            Sign in to manage your compliance filings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {isExisting && (
                            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                                An account with that email already exists. Please sign in below, or{" "}
                                <Link href="/forgot-password" className="font-semibold underline">reset your password</Link> if needed.
                                {callbackUrl && " You'll be redirected back to your filing after login."}
                            </div>
                        )}
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                    <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-11 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full h-11 text-base shadow-md shadow-primary/20" disabled={isLoading}>
                                {isLoading ? "Signing in..." : (
                                    <>Sign In <ArrowRight className="ml-2 w-4 h-4" /></>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-2">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-3 text-muted-foreground">New here?</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-primary font-semibold hover:underline">
                                Create one free
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

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}
