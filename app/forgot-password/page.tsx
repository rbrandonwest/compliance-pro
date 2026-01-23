import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Forgot Password | ComplianceFlow",
    description: "Reset your password",
}

export default function ForgotPasswordPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/10 p-4">
            <div className="w-full max-w-md bg-background border rounded-lg shadow-sm p-8">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold">Forgot Password?</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    )
}
