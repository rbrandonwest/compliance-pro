"use server"

import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"

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
