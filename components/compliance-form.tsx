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
import { Check, Shield, Users, CreditCard, FileText } from "lucide-react"

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
    officers?: { name: string; title: string; address: string }[]
}

const formSchema = z.object({
    principalAddress: z.string().min(5, "Address required"),
    mailingAddress: z.string().min(5, "Address required"),
    officers: z.array(z.object({
        name: z.string().min(1, "Name required"),
        title: z.string().min(1, "Title required"),
        address: z.string().min(5, "Address required"),
    })),
    registeredAgent: z.object({
        name: z.string().min(1, "RA Name required"),
        address: z.string().min(5, "RA Address required"),
    }),
    termsAccepted: z.boolean().refine(val => val === true, "You must agree to the terms to proceed."),
    addRaService: z.boolean().default(false),
    email: z.string().optional(),
    password: z.string().optional(),
})

// type FormValues = z.infer<typeof formSchema> // Use inference

export function ComplianceForm({ entity }: { entity: EntityData }) {
    const [step, setStep] = useState(1)

    const [isEditingHeader, setIsEditingHeader] = useState(false)
    const [headerValues, setHeaderValues] = useState({
        docId: entity.docId,
        ein: entity.ein
    })

    const { data: session } = useSession()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            principalAddress: entity.principalAddress,
            mailingAddress: entity.mailingAddress || entity.principalAddress,
            officers: entity.officers && entity.officers.length > 0 ? entity.officers : [
                { name: entity.registeredAgentName || "", title: "P", address: entity.principalAddress }
            ],
            registeredAgent: {
                name: entity.registeredAgentName || "",
                address: entity.registeredAgentAddress || entity.principalAddress
            },
            termsAccepted: false,
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

    const handleNext = async () => {
        let valid = false;
        if (step === 1) {
            valid = await form.trigger(["principalAddress", "mailingAddress"]);
        } else if (step === 2) {
            valid = await form.trigger(["officers", "registeredAgent"]);
        }

        if (valid) {
            setStep(step + 1);
            window.scrollTo(0, 0);
        }
    };

    const onSubmit = async (data: FormValues) => {
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
            // Pass the potentially edited docId, include EIN, and FULL DATA in payload
            const payload = {
                ein: headerValues.ein,
                ...data
            };

            const result = await createCheckoutSession(headerValues.docId, payload);

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
                        Roles
                    </div>
                    <div className="h-px bg-border flex-1" />
                    <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 3 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground"}`}>3</div>
                        Review
                    </div>
                </div>
            </div>

            <Card className="shadow-lg border-muted">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className="text-xl mb-1">{entity.name}</CardTitle>
                            {!isEditingHeader ? (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <span>Document ID: {headerValues.docId}</span>
                                    <span>•</span>
                                    <span>EIN: {headerValues.ein}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 ml-1 opacity-70 hover:opacity-100"
                                        onClick={() => setIsEditingHeader(true)}
                                    >
                                        <div className="sr-only">Edit</div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                        </svg>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-3 mt-2 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="space-y-1">
                                        <Label htmlFor="doc-id-edit" className="text-xs">Document ID</Label>
                                        <Input
                                            id="doc-id-edit"
                                            value={headerValues.docId}
                                            onChange={(e) => setHeaderValues(prev => ({ ...prev, docId: e.target.value }))}
                                            className="h-8 text-sm w-32"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="ein-edit" className="text-xs">EIN</Label>
                                        <Input
                                            id="ein-edit"
                                            value={headerValues.ein}
                                            onChange={(e) => setHeaderValues(prev => ({ ...prev, ein: e.target.value }))}
                                            className="h-8 text-sm w-32"
                                        />
                                    </div>
                                    <div className="flex items-end pb-0.5 gap-1">
                                        <Button size="sm" onClick={() => setIsEditingHeader(false)}>Save</Button>
                                    </div>
                                </div>
                            )}
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
                                    {form.formState.errors.principalAddress && <p className="text-destructive text-sm">{form.formState.errors.principalAddress.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Mailing Address</Label>
                                    <Input {...form.register("mailingAddress")} />
                                    {form.formState.errors.mailingAddress && <p className="text-destructive text-sm">{form.formState.errors.mailingAddress.message}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Officers & RA */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

                                {/* Registered Agent Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold text-lg">Registered Agent</h3>
                                    </div>
                                    <div className="grid gap-4 p-4 border rounded-lg bg-muted/5">
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-12 sm:col-span-12">
                                                <Label>Name</Label>
                                                <Input {...form.register("registeredAgent.name")} />
                                                {form.formState.errors.registeredAgent?.name && <p className="text-destructive text-sm">{form.formState.errors.registeredAgent.name.message}</p>}
                                            </div>
                                            <div className="col-span-12">
                                                <Label>Address</Label>
                                                <Input {...form.register("registeredAgent.address")} />
                                                <p className="text-[0.8rem] text-muted-foreground">Must be a Florida street adddress.</p>
                                                {form.formState.errors.registeredAgent?.address && <p className="text-destructive text-sm">{form.formState.errors.registeredAgent.address.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Officers Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold text-lg">Officers & Directors</h3>
                                    </div>

                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid gap-4 p-4 border rounded-lg bg-muted/10 relative">
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-12 sm:col-span-4">
                                                    <Label>Role/Title</Label>
                                                    <Input {...form.register(`officers.${index}.title`)} placeholder="e.g. P, VP, D" />
                                                    {form.formState.errors.officers?.[index]?.title && <p className="text-destructive text-sm">{form.formState.errors.officers[index].title.message}</p>}
                                                </div>
                                                <div className="col-span-12 sm:col-span-8">
                                                    <Label>Name</Label>
                                                    <Input {...form.register(`officers.${index}.name`)} placeholder="Full Name" />
                                                    {form.formState.errors.officers?.[index]?.name && <p className="text-destructive text-sm">{form.formState.errors.officers[index].name.message}</p>}
                                                </div>
                                                <div className="col-span-12">
                                                    <Label>Address</Label>
                                                    <Input {...form.register(`officers.${index}.address`)} placeholder="Address" />
                                                    {form.formState.errors.officers?.[index]?.address && <p className="text-destructive text-sm">{form.formState.errors.officers[index].address.message}</p>}
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
                                        {/* Waive service fee if RA added */}
                                        <span>{form.watch("addRaService") ? <span className="text-green-600 font-medium">$0.00 (Waived)</span> : "$49.00"}</span>
                                    </div>

                                    {form.watch("addRaService") && (
                                        <div className="flex justify-between animate-in fade-in slide-in-from-top-2">
                                            <span>Registered Agent Service</span>
                                            <span>$99.00</span>
                                        </div>
                                    )}

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
                                                We scan and upload your legal mail instantly. Keeps your address private. Includes waived service fee.
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total Due</span>
                                        <span>${(150 + (form.watch("addRaService") ? 99 : 49)).toFixed(2)}</span>
                                    </div>
                                    {form.watch("addRaService") && (
                                        <p className="text-xs text-muted-foreground text-right italic animate-in fade-in">
                                            Includes recurring annual billing for filing + service.
                                        </p>
                                    )}
                                </div>

                                {/* Terms & Conditions */}
                                <div className="flex items-start space-x-2 pt-2">
                                    <Checkbox
                                        id="terms"
                                        checked={form.watch("termsAccepted")}
                                        onCheckedChange={(c) => form.setValue("termsAccepted", c as boolean)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor="terms"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Legal Certification & Agreement
                                        </label>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            By checking this box, I hereby certify that I am authorized to execute this application and that the information supplied is true and accurate. I acknowledge that this service is not affiliated with any government entity and allow US Filing Services to file on my behalf. I understand that submitting false information is a felony. I agree to the <a href="/terms" className="underline">Terms of Service</a>.
                                        </p>
                                        {form.formState.errors.termsAccepted && <p className="text-destructive text-xs font-semibold">{form.formState.errors.termsAccepted.message}</p>}
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

                    <Button onClick={step === 3 ? form.handleSubmit(onSubmit) : handleNext} className="min-w-[120px]">
                        {step === 3 ? (form.formState.isSubmitting ? "Processing..." : "Pay & File Now") : "Next Step"}
                    </Button>
                </CardFooter>
            </Card>
        </div >
    )
}
