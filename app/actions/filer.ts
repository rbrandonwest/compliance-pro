'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function markFilingAsComplete(filingId: number) {
    console.log(`Marking filing ${filingId} as COMPLETE`);

    await prisma.filing.update({
        where: { id: filingId },
        data: {
            status: 'SUCCESS',
            updatedAt: new Date()
        }
    });

    // Also update the FiledEntity
    const filing = await prisma.filing.findUnique({ where: { id: filingId } });
    if (filing) {
        await prisma.filedEntity.update({
            where: { id: filing.businessId },
            data: {
                lastFiled: new Date(),
                inCompliance: true
            }
        });
    }

    revalidatePath('/dashboard/filer');
}
