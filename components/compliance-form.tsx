"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Shield, Users, CreditCard, FileText, AlertCircle, MapPin, ArrowRight, ArrowLeft, Trash2, Plus, Lock, Eye, EyeOff } from "lucide-react"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Types matching DB
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
    })).min(1, "At least one officer is required"),
    registeredAgent: z.object({
        name: z.string().min(1, "RA Name required"),
        address: z.string().min(5, "RA Address required"),
    }),
    termsAccepted: z.boolean().refine(val => val === true, "You must agree to the terms to proceed."),
    addRaService: z.boolean(),
    ein: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const steps = [
    { label: "Address", icon: MapPin },
    { label: "Roles", icon: Users },
    { label: "Review & Pay", icon: CreditCard },
]

export function ComplianceForm({ entity }: { entity: EntityData }) {
    const [step, setStep] = useState(1)
    const [formError, setFormError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    // EIN is the only editable header field — docId is locked to prevent tampering
    const [ein, setEin] = useState(entity.ein)
    const [isEditingEin, setIsEditingEin] = useState(false)

    const { data: session } = useSession()

    const form = useForm<FormValues>({
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
            ein: entity.ein,
            email: "",
            password: ""
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "officers"
    })

    const handleNext = async () => {
        setFormError(null);
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
        setFormError(null);

        try {
            // 1. Handle Registration if needed
            if (!session) {
                if (!data.email || !data.password) {
                    setFormError("Please enter an email and password to create your account.");
                    return;
                }

                const { registerUser } = await import("@/app/actions/auth");
                const regResult = await registerUser(data.email, data.password);

                if (!regResult.success) {
                    if (regResult.code === "USER_EXISTS") {
                        router.push(`/login?callbackUrl=${encodeURIComponent(`/file/${entity.docId}`)}&existing=true`);
                        return;
                    }
                    setFormError("Registration failed: " + regResult.error);
                    return;
                }

                // Auto-login
                const signInResult = await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    redirect: false
                });

                if (signInResult?.error) {
                    setFormError("Login after registration failed. Please try logging in manually.");
                    return;
                }
            }

            // 2. Process Checkout — use the server-provided docId, not a user-editable one
            const { createCheckoutSession } = await import("@/app/actions/checkout");
            const payload = {
                ein,
                ...data
            };

            const result = await createCheckoutSession(entity.docId, payload);

            if (result.success && result.url) {
                window.location.href = result.url;
            } else {
                setFormError(result.error || "Payment initialization failed. Please try again.");
            }
        } catch (err) {
            console.error("Checkout Error:", err)
            setFormError("An unexpected error occurred. Please try again.");
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            {/* Progress Steps */}
            <div className="mb-10">
                <div className="flex items-center justify-between relative">
                    {/* Progress line background */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((s, i) => {
                        const stepNum = i + 1
                        const isActive = step === stepNum
                        const isCompleted = step > stepNum
                        return (
                            <div key={i} className="flex flex-col items-center relative z-10">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                    ${isCompleted
                                        ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25"
                                        : isActive
                                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                                            : "bg-card border-border text-muted-foreground"
                                    }
                                `}>
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <s.icon className="w-4 h-4" />
                                    )}
                                </div>
                                <span className={`text-xs font-medium mt-2 transition-colors ${isActive || isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                                    {s.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Card className="shadow-xl shadow-primary/5 border-border/50 overflow-hidden">
                {/* Card Header */}
                <CardHeader className="bg-muted/30 border-b pb-5">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className="text-xl font-bold tracking-tight mb-1.5">{entity.name}</CardTitle>

                            {/* NEW: File for different business link */}
                            <a
                                href="/file"
                                className="inline-flex items-center text-xs font-medium text-primary hover:underline mb-3"
                            >
                                <ArrowLeft className="w-3 h-3 mr-1" />
                                File for a different business
                            </a>

                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="font-mono">{entity.docId}</span>
                                <span className="text-border">|</span>
                                {!isEditingEin ? (
                                    <>
                                        <span>EIN: {ein || 'N/A'}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 ml-1 opacity-70 hover:opacity-100"
                                            onClick={() => setIsEditingEin(true)}
                                        >
                                            <div className="sr-only">Edit EIN</div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                            </svg>
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                                        <Input
                                            id="ein-edit"
                                            value={ein}
                                            onChange={(e) => setEin(e.target.value)}
                                            className="h-8 text-sm w-32"
                                            placeholder="EIN"
                                        />
                                        <Button size="sm" className="h-8" onClick={() => setIsEditingEin(false)}>Save</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-background font-semibold shrink-0">{entity.currentYear} Annual Report</Badge>
                    </div>
                </CardHeader>

                <CardContent className="pt-8 pb-6">
                    {/* Global form error banner */}
                    {formError && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Something went wrong</p>
                                <p className="text-sm opacity-90">{formError}</p>
                            </div>
                        </div>
                    )}

                    <form id="filing-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Step 1: Addresses */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Confirm Business Addresses</h3>
                                        <p className="text-sm text-muted-foreground">Verify or update your business addresses below.</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Principal Address</Label>
                                    <Textarea {...form.register("principalAddress")} className="resize-none min-h-[80px]" />
                                    <p className="text-xs text-muted-foreground">This must be a Florida street address (no P.O. boxes).</p>
                                    {form.formState.errors.principalAddress && <p className="text-destructive text-sm font-medium">{form.formState.errors.principalAddress.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Mailing Address</Label>
                                    <Textarea {...form.register("mailingAddress")} className="resize-none min-h-[80px]" />
                                    {form.formState.errors.mailingAddress && <p className="text-destructive text-sm font-medium">{form.formState.errors.mailingAddress.message}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Officers & RA */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

                                {/* Registered Agent Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Registered Agent</h3>
                                            <p className="text-sm text-muted-foreground">Your designated agent for legal correspondence.</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 p-5 border border-border/50 rounded-xl bg-muted/20">
                                        <div>
                                            <Label className="text-sm font-medium">Agent Name</Label>
                                            <Input {...form.register("registeredAgent.name")} className="h-11 mt-1.5" />
                                            {form.formState.errors.registeredAgent?.name && <p className="text-destructive text-sm mt-1 font-medium">{form.formState.errors.registeredAgent.name.message}</p>}
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Agent Address</Label>
                                            <Textarea {...form.register("registeredAgent.address")} className="resize-none min-h-[80px] mt-1.5" />
                                            <p className="text-xs text-muted-foreground mt-1">Must be a Florida street address.</p>
                                            {form.formState.errors.registeredAgent?.address && <p className="text-destructive text-sm mt-1 font-medium">{form.formState.errors.registeredAgent.address.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Officers Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Officers & Directors</h3>
                                            <p className="text-sm text-muted-foreground">At least one officer or director is required.</p>
                                        </div>
                                    </div>

                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-5 border border-border/50 rounded-xl bg-muted/10 relative group">
                                            <div className="grid gap-4">
                                                <div className="grid grid-cols-12 gap-4">
                                                    <div className="col-span-12 sm:col-span-4">
                                                        <Label className="text-sm font-medium">Role/Title</Label>
                                                        <Input {...form.register(`officers.${index}.title`)} placeholder="e.g. P, VP, D" className="h-11 mt-1.5" />
                                                        {form.formState.errors.officers?.[index]?.title && <p className="text-destructive text-sm mt-1 font-medium">{form.formState.errors.officers[index].title.message}</p>}
                                                    </div>
                                                    <div className="col-span-12 sm:col-span-8">
                                                        <Label className="text-sm font-medium">Full Name</Label>
                                                        <Input {...form.register(`officers.${index}.name`)} placeholder="Full Name" className="h-11 mt-1.5" />
                                                        {form.formState.errors.officers?.[index]?.name && <p className="text-destructive text-sm mt-1 font-medium">{form.formState.errors.officers[index].name.message}</p>}
                                                    </div>
                                                    <div className="col-span-12">
                                                        <Label className="text-sm font-medium">Address</Label>
                                                        <Textarea {...form.register(`officers.${index}.address`)} placeholder="Street Address" className="resize-none min-h-[80px] mt-1.5" />
                                                        {form.formState.errors.officers?.[index]?.address && <p className="text-destructive text-sm mt-1 font-medium">{form.formState.errors.officers[index].address.message}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                    className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    <Button type="button" variant="outline" onClick={() => append({ name: "", title: "", address: "" })} className="w-full border-dashed h-11 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Officer / Director
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Checkout and Account */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Review & Payment</h3>
                                        <p className="text-sm text-muted-foreground">Confirm your details and proceed to secure checkout.</p>
                                    </div>
                                </div>

                                {!session ? (
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-primary" />
                                            <h4 className="font-semibold text-sm text-primary">Create Your Account</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium">Email Address</Label>
                                                <Input {...form.register("email")} placeholder="you@example.com" className="h-11" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium">Password</Label>
                                                <div className="relative">
                                                    <Input {...form.register("password")} type={showPassword ? "text" : "password"} placeholder="Create a password" className="h-11 pr-10" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="text-xs text-muted-foreground space-y-0.5">
                                            <li className={((form.watch("password") || "").length >= 8) ? "text-green-600" : ""}>At least 8 characters</li>
                                            <li className={/[A-Z]/.test(form.watch("password") || "") ? "text-green-600" : ""}>One uppercase letter</li>
                                            <li className={/[a-z]/.test(form.watch("password") || "") ? "text-green-600" : ""}>One lowercase letter</li>
                                            <li className={/[0-9]/.test(form.watch("password") || "") ? "text-green-600" : ""}>One number</li>
                                        </ul>
                                        <p className="text-xs text-muted-foreground">
                                            We&apos;ll automatically create your account and sign you in so you can track this filing.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2.5 text-green-700">
                                        <Check className="w-5 h-5" />
                                        <span className="text-sm font-medium">Logged in as {session.user?.email}</span>
                                    </div>
                                )}

                                {/* Pricing Breakdown */}
                                <div className="bg-muted/20 p-5 rounded-xl space-y-3 border border-border/30">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">State Filing Fee</span>
                                        <span className="font-medium">$150.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Service Fee</span>
                                        <span className="font-medium">$79.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-muted-foreground">Credit Card Processing Fee (3%)</span>
                                        <span className="font-medium">$6.87</span>
                                    </div>

                                    <Separator />

                                    <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                        <Checkbox
                                            id="ra-service"
                                            checked={form.watch("addRaService")}
                                            onCheckedChange={(c) => form.setValue("addRaService", c as boolean)}
                                            className="mt-1"
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label htmlFor="ra-service" className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Add Annual Auto-Filing (Free)
                                            </label>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Lock in this year's service fee and gain peace of mind knowing that your annual report will be filed each year on time.
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between font-bold text-lg pt-1">
                                        <span>Total Due</span>
                                        <span className="text-primary">$235.87</span>
                                    </div>
                                    {form.watch("addRaService") && (
                                        <p className="text-xs text-muted-foreground text-right italic animate-in fade-in">
                                            Includes recurring annual billing for filing + service.
                                        </p>
                                    )}
                                </div>

                                {/* Terms & Conditions */}
                                <div className="flex items-start space-x-3 pt-2">
                                    <Checkbox
                                        id="terms"
                                        checked={form.watch("termsAccepted")}
                                        onCheckedChange={(c) => form.setValue("termsAccepted", c as boolean)}
                                        className="mt-0.5"
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor="terms"
                                            className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Legal Certification & Agreement
                                        </label>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            By checking this box, I hereby certify that I am authorized to execute this application and that the information supplied is true and accurate. I acknowledge that this service is not affiliated with any government entity and allow US Filing Services to file on my behalf. I understand that submitting false information is a felony. I agree to the <a href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</a>.
                                        </p>
                                        {form.formState.errors.termsAccepted && <p className="text-destructive text-xs font-semibold">{form.formState.errors.termsAccepted.message}</p>}
                                    </div>
                                </div>

                            </div>
                        )}
                    </form>
                </CardContent>

                {/* Card Footer */}
                <CardFooter className="flex justify-between bg-muted/20 border-t py-5 px-6">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => { setStep(step - 1); setFormError(null); }} className="h-11">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    <Button
                        onClick={step === 3 ? form.handleSubmit(onSubmit) : handleNext}
                        disabled={form.formState.isSubmitting}
                        className="min-w-[160px] h-11 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
                    >
                        {step === 3 ? (
                            form.formState.isSubmitting ? "Processing..." : (
                                <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Pay & File Now
                                </>
                            )
                        ) : (
                            <>
                                Next Step
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Trust footer */}
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    256-bit SSL
                </span>
                <span className="text-border">|</span>
                <span>Powered by Stripe</span>
                <span className="text-border">|</span>
                <span>PCI Level 1 Certified</span>
            </div>
        </div>
    )
}
