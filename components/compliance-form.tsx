"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Shield, Users, CreditCard } from "lucide-react"

import { signIn, useSession } from "next-auth/react"

// Types matching DB/Mock
export type EntityData = {
    docId: string
    name: string
    ein: string
    principalAddress: string
    mailingAddress: string
    registeredAgentName: string
    registeredAgentAddress: string
    currentYear: number
}

const formSchema = z.object({
    principalAddress: z.string().min(5, "Address required"),
    mailingAddress: z.string().min(5, "Address required"),
    officers: z.array(z.object({
        name: z.string().min(1, "Name required"),
        title: z.string().min(1, "Title required"),
        address: z.string().min(5, "Address required"),
    })),
    addRaService: z.boolean().default(false),
    email: z.string().optional(),
    password: z.string().optional(),
})

// type FormValues = z.infer<typeof formSchema> // Use inference

export function ComplianceForm({ entity }: { entity: EntityData }) {
    const [step, setStep] = useState(1)

    const { data: session } = useSession()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            principalAddress: entity.principalAddress,
            mailingAddress: entity.mailingAddress,
            officers: [
                { name: "VAN STEPHEN SALIBA", title: "P", address: entity.principalAddress } // Mock initial officer
            ],
            addRaService: false,
            email: "",
            password: ""
        }
    })

    // Derive type from form.control if needed, or use inferred type for onSubmit
    type FormValues = z.infer<typeof formSchema>

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "officers"
    })

    const onSubmit = async (data: FormValues) => {
        if (step < 3) {
            setStep(step + 1)
            return
        }

        try {
            // 1. Handle Registration if needed
            if (!session) {
                if (!data.email || !data.password) {
                    alert("Please enter an email and password to create your account.");
                    return;
                }

                const { registerUser } = await import("@/app/actions/auth");
                const regResult = await registerUser(data.email, data.password);

                if (!regResult.success) {
                    alert("Registration failed: " + regResult.error);
                    return;
                }

                // Auto-login
                const signInResult = await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    redirect: false
                });

                if (signInResult?.error) {
                    alert("Login after registration failed.");
                    return;
                }
            }

            // 2. Process Checkout
            const { createCheckoutSession } = await import("@/app/actions/checkout");
            const result = await createCheckoutSession(entity.docId, {});

            if (result.success && result.url) {
                // Redirect to Stripe Checkout
                window.location.href = result.url;
            } else if (result.success) {
                // Fallback for mock/free (shouldn't happen with Stripe active)
                window.location.href = "/dashboard?filed=true";
            } else {
                alert("Payment initialization failed: " + result.error);
            }
        } catch (err) {
            console.error("Checkout Error:", err)
            alert("Checkout failed. Please try again.")
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            {/* Progress */}
            <div className="mb-8 pl-1">
                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                    <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground"}`}>1</div>
                        Address
                    </div>
                    <div className="h-px bg-border flex-1" />
                    <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground"}`}>2</div>
                        Officers
                    </div>
                    <div className="h-px bg-border flex-1" />
                    <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 3 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground"}`}>3</div>
                        Review & Pay
                    </div>
                </div>
            </div>

            <Card className="shadow-lg border-muted">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">{entity.name}</CardTitle>
                            <CardDescription>Document ID: {entity.docId} • EIN: {entity.ein}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-background">{entity.currentYear} Annual Report</Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form id="filing-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Step 1: Addresses */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Confirm Business Addresses</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label>Principal Address</Label>
                                    <Input {...form.register("principalAddress")} />
                                    <p className="text-[0.8rem] text-muted-foreground">This must be a street address.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Mailing Address</Label>
                                    <Input {...form.register("mailingAddress")} />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Officers */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Officer & Director Management</h3>
                                </div>

                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid gap-4 p-4 border rounded-lg bg-muted/10 relative">
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-12 sm:col-span-4">
                                                <Label>Role/Title</Label>
                                                <Input {...form.register(`officers.${index}.title`)} placeholder="e.g. P, VP, D" />
                                            </div>
                                            <div className="col-span-12 sm:col-span-8">
                                                <Label>Name</Label>
                                                <Input {...form.register(`officers.${index}.name`)} placeholder="Full Name" />
                                            </div>
                                            <div className="col-span-12">
                                                <Label>Address</Label>
                                                <Input {...form.register(`officers.${index}.address`)} placeholder="Address" />
                                            </div>
                                        </div>
                                        {fields.length > 1 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="absolute top-2 right-2 text-destructive hover:bg-destructive/10">
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={() => append({ name: "", title: "", address: "" })} className="w-full border-dashed">
                                    + Add Officer / Director
                                </Button>
                            </div>
                        )}

                        {/* Step 3: Checkout and Account */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Review & Payment</h3>
                                </div>

                                {!session ? (
                                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-primary" />
                                            <h4 className="font-semibold text-sm text-primary">Create Your Account</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Email Address</Label>
                                                <Input {...form.register("email")} placeholder="you@example.com" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Password</Label>
                                                <Input {...form.register("password")} type="password" placeholder="Create a password" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            We'll automatically create your account and sign you in so you can track this filing.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
                                        <Check className="w-4 h-4" />
                                        <span className="text-sm font-medium">Logged in as {session.user?.email}</span>
                                    </div>
                                )}

                                <div className="bg-muted/20 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between">
                                        <span>State Filing Fee</span>
                                        <span>$150.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Service Fee</span>
                                        <span>$49.00</span>
                                    </div>

                                    <Separator />

                                    <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-md">
                                        <Checkbox
                                            id="ra-service"
                                            checked={form.watch("addRaService")}
                                            onCheckedChange={(c) => form.setValue("addRaService", c as boolean)}
                                            className="mt-1"
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label htmlFor="ra-service" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Add Registered Agent Service (+$99/yr)
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                We scan and upload your legal mail instantly. Keeps your address private.
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total Due</span>
                                        <span>${(199 + (form.watch("addRaService") ? 99 : 0)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between bg-muted/10 py-4">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)}>
                            Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    <Button onClick={form.handleSubmit(onSubmit)} className="min-w-[120px]">
                        {step === 3 ? (form.formState.isSubmitting ? "Processing..." : "Pay & File Now") : "Next Step"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
