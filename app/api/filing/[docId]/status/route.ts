import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming this export works now, or I'll fix it
// If lib/prisma.ts exports default prisma, then mock import needs valid path.

export async function GET(
    request: Request,
    { params }: { params: Promise<{ docId: string }> }
) {
    const docId = (await params).docId;

    const entity = await prisma.businessDocument.findUnique({
        where: { documentNumber: docId },
        include: { filedEntities: { include: { filings: { orderBy: { createdAt: 'desc' }, take: 1 } } } }
    });

    if (!entity) {
        return NextResponse.json({ status: 'NotFound' }, { status: 404 });
    }

    const latestFiling = entity?.filedEntities[0]?.filings[0];

    return NextResponse.json({
        status: latestFiling ? latestFiling.status : 'Pending',
        filingId: latestFiling?.id
    });
}
