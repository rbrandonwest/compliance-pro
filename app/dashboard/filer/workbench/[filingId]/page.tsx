import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { markFilingAsComplete } from "@/app/actions/filer";

export default async function WorkbenchPage({ params }: { params: { filingId: string } }) {
    // Wait for params
    const { filingId } = await params;
    const id = parseInt(filingId);

    if (isNaN(id)) notFound();

    const filing = await prisma.filing.findUnique({
        where: { id },
        include: {
            entity: {
                include: { businessDoc: true }
            }
        }
    });

    if (!filing) notFound();

    const doc = filing.entity.businessDoc;
    const snap = (filing.payloadSnapshot as any) || {};

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-14 border-b bg-background flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/filer">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Queue
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-border" />
                    <h1 className="font-semibold text-lg">{filing.entity.businessName}</h1>
                    <Badge variant="outline">{filing.entity.documentNumber}</Badge>
                </div>

                <div className="flex items-center gap-2">
                    <form action={async () => {
                        'use server';
                        await markFilingAsComplete(id);
                        redirect('/dashboard/filer');
                    }}>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                            <CheckCircle className="w-4 h-4" /> Mark as Filed
                        </Button>
                    </form>
                </div>
            </header>

            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Info Panel (1/4 width approx, min 300px) */}
                <div className="w-[350px] border-r bg-muted/10 overflow-y-auto p-4 space-y-6 shrink-0">
                    <section>
                        <h3 className="font-semibold mb-2">Business Details</h3>
                        <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">Name</div>
                            <div>{doc.companyName}</div>
                            <div className="text-muted-foreground mt-2">Document #</div>
                            <div className="font-mono">{doc.documentNumber}</div>
                            <div className="text-muted-foreground mt-2">FEI/EIN</div>
                            <div>{doc.ein || snap.ein || 'N/A'}</div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-2">Officers</h3>
                        <div className="text-sm space-y-2 border rounded p-2 bg-background">
                            {doc.firstOfficerName && (
                                <div>
                                    <div className="font-medium text-xs text-muted-foreground">{doc.firstOfficerTitle}</div>
                                    <div>{doc.firstOfficerName}</div>
                                </div>
                            )}
                            {doc.secondOfficerName && (
                                <div className="mt-2">
                                    <div className="font-medium text-xs text-muted-foreground">{doc.secondOfficerTitle}</div>
                                    <div>{doc.secondOfficerName}</div>
                                </div>
                            )}
                            {!doc.firstOfficerName && <div className="text-muted-foreground">No officer data in record. Check snapshot.</div>}
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-2">Mailing Address (Snapshot)</h3>
                        <div className="text-sm border rounded p-2 bg-background">
                            {snap.mailingAddress || "No override provided."}
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-2">Helpful Links</h3>
                        <a
                            href={`https://search.sunbiz.org/Inquiry/CorporationSearch/ByName`}
                            target="_blank"
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                        >
                            <ExternalLink className="w-3 h-3" /> Sunbiz Search
                        </a>
                    </section>
                </div>

                {/* Right: Iframe (Rest of width) */}
                <div className="flex-1 bg-white relative">
                    <iframe
                        src="https://services.sunbiz.org/Filings/AnnualReport/FilingStart"
                        className="w-full h-full border-none"
                        title="Sunbiz Filing Portal"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                </div>
            </div>
        </div>
    )
}
