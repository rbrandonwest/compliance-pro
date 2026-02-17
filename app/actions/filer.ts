'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/resend"
import FilingCompleteEmail from "@/components/emails/FilingCompleteEmail"
import * as React from 'react'

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
    const filing = await prisma.$transaction(async (tx) => {
        const updatedFiling = await tx.filing.update({
            where: { id: filingId },
            data: {
                status: 'SUCCESS',
            },
            include: {
                user: true,
                entity: true,
            }
        });

        await tx.filedEntity.update({
            where: { id: updatedFiling.businessId },
            data: {
                lastFiled: new Date(),
                inCompliance: true
            }
        });

        return updatedFiling;
    });

    // Send completion email to the user
    if (filing.user.email) {
        await sendEmail({
            to: filing.user.email,
            subject: `Your ${filing.year} Annual Report Has Been Filed - ${filing.entity.businessName}`,
            react: React.createElement(FilingCompleteEmail, {
                companyName: filing.entity.businessName,
                year: filing.year,
                documentNumber: filing.entity.documentNumber,
            }),
        });
    }

    revalidatePath('/dashboard/filer');
}
