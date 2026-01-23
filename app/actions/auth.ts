"use server"

import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"
import { resend } from "@/lib/resend"
import crypto from "crypto"

export async function registerUser(email: string, password: string, firstName?: string, lastName?: string) {
    if (!email || !password) {
        return { success: false, error: "Missing fields" }
    }

    try {
        const exists = await prisma.user.findUnique({
            where: { email }
        })

        if (exists) {
            return { success: false, error: "User already exists" }
        }

        const hashedPassword = await hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: "CLIENT"
            }
        })

        return { success: true, user: { id: user.id, email: user.email, name: user.firstName } }
    } catch (error) {
        console.error("Registration error:", error)
        return { success: false, error: "Registration failed" }
    }
}


export async function forgotPassword(email: string) {
    if (!email) return { success: false, error: "Email required" }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        // Return success even if user not found to prevent enumeration
        return { success: true }
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires
        }
    })

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    try {
        await resend.emails.send({
            from: 'ComplianceFlow <onboarding@resend.dev>', // Update with verify domain if available, else standard resend.dev
            to: email,
            subject: 'Reset your password',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
        })
    } catch (error) {
        console.error("Resend error:", error)
        return { success: false, error: "Failed to send email" }
    }

    return { success: true }
}

export async function resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) return { success: false, error: "Missing fields" }

    const existingToken = await prisma.passwordResetToken.findUnique({
        where: { token }
    })

    if (!existingToken) return { success: false, error: "Invalid token" }

    const hasExpired = new Date() > existingToken.expires
    if (hasExpired) {
        return { success: false, error: "Token expired" }
    }

    const existingUser = await prisma.user.findUnique({ where: { email: existingToken.email } })
    if (!existingUser) return { success: false, error: "User not found" }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
    })

    await prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
    })

    return { success: true }
}
