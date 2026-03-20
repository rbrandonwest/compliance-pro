"use server"

import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"
import { sendEmail } from "@/lib/resend"
import crypto from "crypto"

function validatePassword(password: string): string | null {
    if (password.length < 8) {
        return "Password must be at least 8 characters long"
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter"
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number"
    }
    return null
}

export async function registerUser(email: string, password: string, firstName?: string, lastName?: string) {
    if (!email || !password) {
        return { success: false, error: "Missing fields" }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return { success: false, error: "Invalid email format" }
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
        return { success: false, error: passwordError }
    }

    const normalizedEmail = email.toLowerCase().trim()

    try {
        const exists = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        })

        if (exists) {
            return { success: false, error: "User already exists", code: "USER_EXISTS" as const }
        }

        const hashedPassword = await hash(password, 12)

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
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

    const normalizedEmail = email.toLowerCase().trim()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
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

    const sent = await sendEmail({
        to: email,
        subject: 'Reset your password',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
    })

    if (!sent) {
        return { success: false, error: "Failed to send email" }
    }

    return { success: true }
}

export async function resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) return { success: false, error: "Missing fields" }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
        return { success: false, error: passwordError }
    }

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

    const hashedPassword = await hash(newPassword, 12)

    await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
    })

    await prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
    })

    return { success: true }
}
