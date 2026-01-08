import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function ClientDashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    const currentYear = new Date().getFullYear();

    // Fetch user entities (FiledEntity)
    // We need to fetch the relation including filings
    const entities = await prisma.filedEntity.findMany({
        where: { userId: session.user.id },
        include: {
            filings: { orderBy: { createdAt: 'desc' } } // Fetch all filings for history
        }
    });

    return (
        <div className="min-h-screen bg-muted/10 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Client Dashboard</h1>
                        <p className="text-muted-foreground">Manage your Florida business compliance.</p>
                    </div>
                </header>

                {entities.length === 0 ? (
                    <div className="text-center py-20 rounded-lg border border-dashed">
                        <h3 className="text-lg font-semibold">No businesses found.</h3>
                        <p className="text-muted-foreground">Get started by finding your business.</p>
                        <Link href="/"><Button className="mt-4">File Annual Report</Button></Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {entities.map((entity) => {
                            const lastFiling = entity.filings[0];

                            // Definition of Compliance:
                            // If lastFiled date is in the current year OR we have a SUCCESS filing for current year.
                            const lastFiledYear = entity.lastFiled ? new Date(entity.lastFiled).getFullYear() : 0;
                            const isCompliant = lastFiledYear === currentYear || (lastFiling?.year === currentYear && lastFiling?.status === 'SUCCESS');

                            // Determine display status for badge
                            let displayStatus = "PENDING";
                            let needsFilingAction = true;

                            if (isCompliant) {
                                displayStatus = "SUCCESS";
                                needsFilingAction = false;
                            } else if (lastFiling) {
                                // If we have a pending filing, show its status
                                displayStatus = lastFiling.status;
                                if (['PROCESSING', 'PAID', 'SUCCESS', 'MANUAL_REVIEW'].includes(displayStatus)) {
                                    needsFilingAction = false; // Already in progress
                                }
                            }

                            return (
                                <Card key={entity.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-xl font-semibold">
                                            {entity.businessName}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {isCompliant ? (
                                                <div className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-sm font-medium flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" /> Compliant ({currentYear})
                                                </div>
                                            ) : (
                                                <StatusBadge docId={entity.documentNumber} initialStatus={displayStatus} needsFiling={needsFilingAction} />
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div>Document ID: <span className="font-mono text-foreground">{entity.documentNumber}</span></div>
                                                <div>Last Filed: {entity.lastFiled ? new Date(entity.lastFiled).toLocaleDateString() : 'Never'}</div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <FilingHistoryDialog businessName={entity.businessName} filings={entity.filings} />

                                                {needsFilingAction ? (
                                                    <Link href={`/file/${entity.documentNumber}`}>
                                                        <Button className="w-full md:w-auto shadow-lg shadow-red-500/20">
                                                            File {currentYear} Report <ArrowRight className="ml-2 w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button variant="outline" disabled className="w-full md:w-auto opacity-50">
                                                        {isCompliant ? `Filed for ${currentYear}` : `Status: ${displayStatus}`}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
import { FilingHistoryDialog } from "@/components/dashboard/filing-history-dialog";
