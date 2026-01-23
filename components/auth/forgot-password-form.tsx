"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPassword } from "@/app/actions/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
})

type FormValues = z.infer<typeof formSchema>

export function ForgotPasswordForm() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState("")

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    })

    const onSubmit = async (data: FormValues) => {
        setStatus("loading")
        try {
            const result = await forgotPassword(data.email)
            if (result.success) {
                setStatus("success")
            } else {
                setStatus("error")
                setErrorMessage(result.error || "Something went wrong")
            }
        } catch (error) {
            setStatus("error")
            setErrorMessage("An unexpected error occurred")
        }
    }

    if (status === "success") {
        return (
            <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                    If an account exists for that email, we have sent a password reset link. Please check your inbox.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
                {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
            </div>

            {status === "error" && (
                <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" className="w-full" disabled={status === "loading"}>
                {status === "loading" ? "Sending..." : "Send Reset Link"}
            </Button>
        </form>
    )
}
