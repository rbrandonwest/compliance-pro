import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { getBrand } from "@/lib/brands"
import { headers } from "next/headers"
import Stripe from "stripe"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { docId, addRaService, email, returnUrl } = body

        const brand = await getBrand()

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Florida Annual Report Filing Fee",
                        description: "Pass-through state fee",
                    },
                    unit_amount: 15000, // $150.00
                },
                quantity: 1,
            },
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "ComplianceFlow Service Fee",
                        description: "Filing preparation and submission",
                    },
                    unit_amount: 4900, // $49.00
                },
                quantity: 1,
            },
        ]

        if (addRaService) {
            line_items.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Registered Agent Service (Annual)",
                        description: "Secure legal mail handling",
                    },
                    recurring: {
                        interval: "year",
                    },
                    unit_amount: 9900, // $99.00
                },
                quantity: 1,
            })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: addRaService ? "subscription" : "payment", // If RA service is added, it's a subscription (mixed mode handles one-time + recurring)
            // Actually mixed mode uses 'subscription' if there's any recurring item? 
            // Stripe Checkout supports mixed cart in 'subscription' mode or 'payment' mode with 'setup' intent?
            // Checkout with mixed items (one-time + recurring) must be mode: 'subscription'.
            success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnUrl}?canceled=true`,
            metadata: {
                docId,
                brandId: brand.id,
                filingYear: "2025",
                type: "filing_submission"
            },
            customer_email: email,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error("Stripe Error:", error)
        return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
    }
}
