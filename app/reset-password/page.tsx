import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
    title: "Reset Password | ComplianceFlow",
    description: "Create a new password",
}

export default function ResetPasswordPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/10 p-4">
            <div className="w-full max-w-md bg-background border rounded-lg shadow-sm p-8">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold">Reset Password</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Enter your new password below.
                    </p>
                </div>
                {/* Suspense needed for useSearchParams */}
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
