import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ docId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const docId = (await params).docId;

    // Only return filing status for entities owned by the current user
    const filedEntity = await prisma.filedEntity.findUnique({
        where: {
            userId_documentNumber: {
                userId: session.user.id,
                documentNumber: docId,
            }
        },
        include: {
            filings: {
                where: { status: { not: 'PENDING_PAYMENT' } },
                orderBy: { createdAt: 'desc' },
                take: 1,
            }
        }
    });

    if (!filedEntity) {
        return NextResponse.json({ status: 'NOT_FOUND' }, { status: 404 });
    }

    const latestFiling = filedEntity.filings[0];

    return NextResponse.json({
        status: latestFiling ? latestFiling.status : 'NO_FILING',
        filingId: latestFiling?.id ?? null,
    });
}
