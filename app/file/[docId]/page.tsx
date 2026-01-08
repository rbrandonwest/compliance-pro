import { ComplianceForm, EntityData } from "@/components/compliance-form"
import { notFound } from "next/navigation"

// Mock Data Service
const getEntity = async (docId: string): Promise<EntityData | null> => {
    // Simulator: In real app, prisma.entity.findUnique(...)
    if (docId === "P15000085255") {
        return {
            docId,
            name: "VAN STEPHEN SALIBA, P.A.",
            ein: "00-0000000",
            principalAddress: "123 Main St, Miami, FL 33101",
            mailingAddress: "123 Main St, Miami, FL 33101",
            registeredAgentName: "VAN STEPHEN SALIBA",
            registeredAgentAddress: "123 Main St, Miami, FL 33101",
            currentYear: 2025
        }
    }
    return null
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
