import { ComplianceForm, EntityData } from "@/components/compliance-form"
import { notFound } from "next/navigation"

import prisma from "@/lib/prisma"

// Real Data Service
const getEntity = async (docId: string): Promise<EntityData | null> => {
    const doc = await prisma.businessDocument.findUnique({
        where: { documentNumber: docId }
    });

    if (!doc) return null;

    return {
        docId: doc.documentNumber,
        name: doc.companyName,
        ein: doc.ein || "",
        principalAddress: doc.principalAddress,
        mailingAddress: doc.principalAddress, // Fallback if no specific mailing address column yet
        registeredAgentName: doc.registeredAgentName,
        registeredAgentAddress: doc.principalAddress, // Fallback as RA address isn't separate in schema yet? Check schema.
        currentYear: new Date().getFullYear(),
        officers: [
            ...(doc.firstOfficerName ? [{ name: doc.firstOfficerName, title: doc.firstOfficerTitle || "Officer", address: doc.principalAddress }] : []),
            ...(doc.secondOfficerName ? [{ name: doc.secondOfficerName, title: doc.secondOfficerTitle || "Officer", address: doc.principalAddress }] : [])
        ]
    }
}

type Props = {
    params: Promise<{
        docId: string
    }>
}

export default async function FilingPage({ params }: Props) {
    const { docId } = await params // Changed to `await params` because `params` is now a Promise.
    const entity = await getEntity(docId)

    if (!entity) {
        return notFound()
    }

    return (
        <div className="min-h-screen bg-muted/10 pb-20">
            <header className="bg-background border-b py-4 mb-8">
                <div className="container mx-auto px-4 font-bold text-xl flex items-center justify-center">
                    Secure Annual Report Filing
                </div>
            </header>

            <main className="container mx-auto px-4">
                <ComplianceForm entity={entity} />
            </main>
        </div>
    )
}
