'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function requireFilerOrAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user.role !== "FILER" && session.user.role !== "ADMIN")) {
        throw new Error("Unauthorized: Filer or Admin access required");
    }
    return session;
}

export async function markFilingAsComplete(filingId: number) {
    await requireFilerOrAdmin();

    // Use a transaction to update both filing and entity atomically
    await prisma.$transaction(async (tx) => {
        const filing = await tx.filing.update({
            where: { id: filingId },
            data: {
                status: 'SUCCESS',
            }
        });

        await tx.filedEntity.update({
            where: { id: filing.businessId },
            data: {
                lastFiled: new Date(),
                inCompliance: true
            }
        });
    });

    revalidatePath('/dashboard/filer');
}
