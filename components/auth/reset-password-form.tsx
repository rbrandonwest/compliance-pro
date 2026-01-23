"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/app/actions/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type FormValues = z.infer<typeof formSchema>

export function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState("")

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    })

    const onSubmit = async (data: FormValues) => {
        if (!token) {
            setStatus("error")
            setErrorMessage("Invalid or missing token")
            return
        }

        setStatus("loading")
        try {
            const result = await resetPassword(token, data.password)
            if (result.success) {
                setStatus("success")
                setTimeout(() => {
                    router.push("/login")
                }, 3000)
            } else {
                setStatus("error")
                setErrorMessage(result.error || "Failed to reset password")
            }
        } catch (error) {
            setStatus("error")
            setErrorMessage("An unexpected error occurred")
        }
    }

    if (!token) {
        return <Alert variant="destructive"><AlertDescription>Invalid password reset link.</AlertDescription></Alert>
    }

    if (status === "success") {
        return (
            <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                    Password reset successfully! Redirecting to login...
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
                {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                )}
            </div>

            {status === "error" && (
                <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" className="w-full" disabled={status === "loading"}>
                {status === "loading" ? "Resetting..." : "Reset Password"}
            </Button>
        </form>
    )
}
