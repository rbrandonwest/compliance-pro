import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react"

import { SearchInput } from "@/components/dashboard/search-input"

export default async function FilerDashboardPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    if (session.user.role !== "FILER" && session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const params = await searchParams;
    const query = params?.q || "";

    // Build filter
    const whereClause: any = {};
    if (query) {
        whereClause.OR = [
            { entity: { businessName: { contains: query, mode: 'insensitive' } } },
            { entity: { documentNumber: { contains: query, mode: 'insensitive' } } },
            { entity: { businessDoc: { ein: { contains: query, mode: 'insensitive' } } } },
            { user: { email: { contains: query, mode: 'insensitive' } } },
            { user: { firstName: { contains: query, mode: 'insensitive' } } },
            { user: { lastName: { contains: query, mode: 'insensitive' } } },
        ];
    }

    // Fetch all filings
    const filings = await prisma.filing.findMany({
        where: whereClause,
        include: {
            entity: true, // FiledEntity
            user: true
        },
        orderBy: { createdAt: 'desc' }
    });

    const pendingStatuses = ['PENDING', 'PAID', 'MANUAL_REVIEW', 'PROCESSING'];
    const pendingFilings = filings.filter(f => pendingStatuses.includes(f.status));
    const completedFilings = filings.filter(f => f.status === 'SUCCESS');

    return (
        <div className="min-h-screen bg-muted/10 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Filer Dashboard</h1>
                        <p className="text-muted-foreground">Manage filing queue and submissions.</p>
                    </div>
                    <SearchInput placeholder="Search filings..." />
                </header>

                {/* Pending Queue */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-500" />
                            Pending Queue ({pendingFilings.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingFilings.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {query ? "No pending filings matching your search." : "No pending filings."}
                            </div>
                        ) : (
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3">Business</th>
                                            <th className="px-4 py-3">Doc ID</th>
                                            <th className="px-4 py-3">Requester</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingFilings.map((filing) => (
                                            <tr key={filing.id} className="border-b">
                                                <td className="px-4 py-3 font-medium">{filing.entity.businessName}</td>
                                                <td className="px-4 py-3 font-mono">{filing.entity.documentNumber}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{filing.user.firstName} {filing.user.lastName}</div>
                                                    <div className="text-xs text-muted-foreground">{filing.user.email}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={filing.status === 'MANUAL_REVIEW' ? 'destructive' : 'default'}>
                                                        {filing.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(filing.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link href={`/dashboard/filer/workbench/${filing.id}`}>
                                                        <Button size="sm">File Now</Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Completed History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Completed History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {completedFilings.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {query ? "No completed filings matching your search." : "No completed filings yet."}
                            </div>
                        ) : (
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3">Business</th>
                                            <th className="px-4 py-3">Doc ID</th>
                                            <th className="px-4 py-3">Requester</th>
                                            <th className="px-4 py-3">Completed At</th>
                                            <th className="px-4 py-3">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedFilings.map((filing) => (
                                            <tr key={filing.id} className="border-b">
                                                <td className="px-4 py-3 font-medium">{filing.entity.businessName}</td>
                                                <td className="px-4 py-3 font-mono">{filing.entity.documentNumber}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{filing.user.firstName} {filing.user.lastName}</div>
                                                    <div className="text-xs text-muted-foreground">{filing.user.email}</div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(filing.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {filing.sunbizReceiptUrl && (
                                                        <a href={filing.sunbizReceiptUrl} target="_blank" className="text-blue-600 hover:underline">
                                                            View Receipt
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
