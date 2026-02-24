'use server'

import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

export async function updateUserRole(userId: string, newRole: 'ADMIN' | 'FILER' | 'CLIENT') {
    await requireAdmin();

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });
    revalidatePath('/dashboard/admin');
}

export async function deleteUser(userId: string) {
    const session = await requireAdmin();

    // Prevent self-deletion
    if (userId === session.user.id) {
        throw new Error("Cannot delete your own account");
    }

    // Check target user isn't an admin
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
        throw new Error("User not found");
    }
    if (targetUser.role === 'ADMIN') {
        throw new Error("Cannot delete admin users");
    }

    // Cascade: delete filings, then filed entities, then user
    await prisma.$transaction(async (tx) => {
        // Delete artifacts for user's filings
        await tx.artifact.deleteMany({
            where: { filing: { userId } }
        });
        // Delete filings
        await tx.filing.deleteMany({
            where: { userId }
        });
        // Delete filed entities
        await tx.filedEntity.deleteMany({
            where: { userId }
        });
        // Delete password reset tokens
        await tx.passwordResetToken.deleteMany({
            where: { email: targetUser.email }
        });
        // Delete user
        await tx.user.delete({
            where: { id: userId }
        });
    });

    revalidatePath('/dashboard/admin');
}

export async function resetUserPassword(userId: string) {
    await requireAdmin();

    // Generate a cryptographically random temporary password
    const tempPassword = crypto.randomBytes(16).toString('base64url');
    const hashedPassword = await hash(tempPassword, 12);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    return { success: true, tempPassword };
}

export async function deleteFiling(filingId: number) {
    await requireAdmin();

    const filing = await prisma.filing.findUnique({ where: { id: filingId } });
    if (!filing) {
        throw new Error("Filing not found");
    }

    await prisma.$transaction(async (tx) => {
        await tx.artifact.deleteMany({ where: { filingId } });
        await tx.filing.delete({ where: { id: filingId } });
    });

    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/filer');
}

