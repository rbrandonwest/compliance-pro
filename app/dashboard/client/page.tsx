import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Building2, FileText, CalendarDays, Plus } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { FilingHistoryDialog } from "@/components/dashboard/filing-history-dialog"
import { getFilingYear } from "@/app/actions/checkout"

export default async function ClientDashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    const filingYear = getFilingYear();

    // Fetch user entities with their most recent filings (limit to avoid loading entire history)
    const entities = await prisma.filedEntity.findMany({
        where: { userId: session.user.id },
        include: {
            filings: {
                orderBy: { createdAt: 'desc' },
                take: 20, // Limit filings per entity for history dialog
            }
        }
    });

    // Summary stats
    const totalEntities = entities.length;
    const compliantCount = entities.filter(e => {
        // Compliant = has a SUCCESS filing for the current filing year
        return e.filings.some(f => f.year === filingYear && f.status === 'SUCCESS');
    }).length;
    const needsAttention = totalEntities - compliantCount;

    return (
        <div className="min-h-screen bg-muted/10">
            <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
                {/* Header */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-primary mb-1">Welcome back</p>
                        <h1 className="text-3xl font-bold tracking-tight">Your Businesses</h1>
                        <p className="text-muted-foreground mt-1">Manage your Florida business compliance filings.</p>
                    </div>
                    <Link href="/file">
                        <Button className="shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                            <Plus className="w-4 h-4 mr-2" />
                            New Filing
                        </Button>
                    </Link>
                </header>

                {/* Summary Cards */}
                {totalEntities > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-card border border-border/50 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{totalEntities}</div>
                                <div className="text-xs text-muted-foreground font-medium">Total Businesses</div>
                            </div>
                        </div>
                        <div className="bg-card border border-border/50 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{compliantCount}</div>
                                <div className="text-xs text-muted-foreground font-medium">Compliant ({filingYear})</div>
                            </div>
                        </div>
                        <div className="bg-card border border-border/50 rounded-xl p-5 flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${needsAttention > 0 ? 'bg-orange-500/10' : 'bg-muted'}`}>
                                <CalendarDays className={`w-5 h-5 ${needsAttention > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                            </div>
                            <div>
                                <div className={`text-2xl font-bold ${needsAttention > 0 ? 'text-orange-500' : ''}`}>{needsAttention}</div>
                                <div className="text-xs text-muted-foreground font-medium">Needs Filing</div>
                            </div>
                        </div>
                    </div>
                )}

                {entities.length === 0 ? (
                    <div className="text-center py-24 rounded-2xl border border-dashed border-border/60 bg-card">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No businesses found</h3>
                        <p className="text-muted-foreground mb-6">Get started by searching for your Florida business.</p>
                        <Link href="/file">
                            <Button className="shadow-md shadow-primary/20">
                                <Plus className="w-4 h-4 mr-2" />
                                Start New Filing
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {entities.map((entity) => {
                            // Filter out PENDING_PAYMENT filings (not yet paid)
                            const paidFilings = entity.filings.filter(f => f.status !== 'PENDING_PAYMENT');

                            // Find the most recent filing for the current filing year
                            const filingForYear = paidFilings.find(f => f.year === filingYear);
                            const lastFiling = paidFilings[0]; // Most recent filing overall (for badge display)

                            // Compliant = has a SUCCESS filing for the current filing year
                            const isCompliant = filingForYear?.status === 'SUCCESS';

                            // Determine display status for badge
                            let displayStatus = "PENDING";
                            let needsFilingAction = true;

                            if (isCompliant) {
                                displayStatus = "SUCCESS";
                                needsFilingAction = false;
                            } else if (filingForYear) {
                                // There's a filing for this year that isn't SUCCESS — show its status
                                displayStatus = filingForYear.status;
                                if (['PENDING', 'PROCESSING', 'PAID', 'MANUAL_REVIEW'].includes(displayStatus)) {
                                    needsFilingAction = false; // Already in progress
                                }
                                // FAILED filings still need action — user can refile
                            }

                            return (
                                <Card key={entity.id} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                                        {/* Left: Business Info */}
                                        <div className="flex items-start gap-4 min-w-0">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isCompliant ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                                                <Building2 className={`w-5 h-5 ${isCompliant ? 'text-green-600' : 'text-primary'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-semibold text-lg truncate">{entity.businessName}</h3>
                                                    {isCompliant ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold shrink-0 border border-green-200">
                                                            <CheckCircle className="w-3.5 h-3.5" /> Compliant
                                                        </span>
                                                    ) : (
                                                        <StatusBadge docId={entity.documentNumber} initialStatus={displayStatus} needsFiling={needsFilingAction} />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <FileText className="w-3.5 h-3.5" />
                                                        <span className="font-mono">{entity.documentNumber}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <CalendarDays className="w-3.5 h-3.5" />
                                                        {entity.lastFiled ? new Date(entity.lastFiled).toLocaleDateString() : 'Never filed'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <FilingHistoryDialog businessName={entity.businessName} filings={paidFilings} />

                                            {needsFilingAction ? (
                                                <Link href={`/file/${entity.documentNumber}`}>
                                                    <Button size="sm" className="shadow-md shadow-red-500/20 hover:shadow-red-500/30 transition-shadow">
                                                        File {filingYear} <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button variant="outline" size="sm" disabled className="opacity-60">
                                                    {isCompliant ? `Filed ${filingYear}` : displayStatus}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
