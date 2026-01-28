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
                        <h3 className="font-semibold mb-2 flex items-center justify-between">
                            Mailing Address
                            {snap.mailingAddress && <Badge variant="outline" className="text-[10px] h-5">User Provided</Badge>}
                        </h3>
                        <div className="text-sm border rounded p-2 bg-background">
                            {snap.mailingAddress || "No override provided."}
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-2 flex items-center justify-between">
                            Registered Agent
                            {snap.registeredAgent && <Badge variant="outline" className="text-[10px] h-5">User Provided</Badge>}
                        </h3>
                        {snap.registeredAgent ? (
                            <div className="text-sm border rounded p-2 bg-background space-y-2">
                                <div><span className="text-muted-foreground text-xs">Name:</span> {snap.registeredAgent.name}</div>
                                <div><span className="text-muted-foreground text-xs">Address:</span> {snap.registeredAgent.address}</div>
                            </div>
                        ) : (
                            <div className="text-sm border rounded p-2 bg-background text-muted-foreground">
                                No RA data in snapshot.
                            </div>
                        )}
                    </section>

                    <section>
                        <h3 className="font-semibold mb-2">Officers</h3>
                        <div className="text-sm space-y-2 border rounded p-2 bg-background">
                            {snap.officers && Array.isArray(snap.officers) && snap.officers.length > 0 ? (
                                snap.officers.map((officer: any, idx: number) => {
                                    const labels = ["One", "Two", "Three", "Four", "Five"];
                                    const label = labels[idx] ? `Officer ${labels[idx]}` : `Officer ${idx + 1}`;

                                    return (
                                        <div key={idx} className={idx > 0 ? "pt-2 border-t mt-2" : ""}>
                                            <div className="font-medium text-xs text-primary mb-1">{label}</div>
                                            <div className="font-medium">{officer.name}</div>
                                            <div className="text-xs text-muted-foreground">{officer.title || "Officer"}</div>
                                            <div className="text-xs text-muted-foreground">{officer.address}</div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-muted-foreground">
                                    No officer data in snapshot. <br />
                                    <span className="text-xs italic">Fallback to DB: {doc.firstOfficerName} ({doc.firstOfficerTitle})</span>
                                </div>
                            )}
                        </div>
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
