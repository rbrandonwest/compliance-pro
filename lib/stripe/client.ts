import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_mock", {
    apiVersion: "2025-12-15.clover", // Use latest supported
    typescript: true,
})
