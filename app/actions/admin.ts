'use server'

import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: 'ADMIN' | 'FILER' | 'CLIENT') {
    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });
    revalidatePath('/dashboard/admin');
}

export async function deleteUser(userId: string) {
    // Delete related data first or cascade?
    // Be careful with deletion.
    await prisma.user.delete({
        where: { id: userId }
    });
    revalidatePath('/dashboard/admin');
}

export async function resetUserPassword(userId: string) {
    const tempPassword = "TempPassword123!";
    const hashedPassword = await hash(tempPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    return { success: true, tempPassword };
}
