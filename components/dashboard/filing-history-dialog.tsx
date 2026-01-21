"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, Download, ExternalLink, History } from "lucide-react"
import { Filing } from "@prisma/client"
import { getPaymentReceiptUrl } from "@/app/actions/billing"
import { useState } from "react"

interface FilingHistoryProps {
    businessName: string;
    filings: Filing[];
}

export function FilingHistoryDialog({ businessName, filings }: FilingHistoryProps) {
    const [receiptUrls, setReceiptUrls] = useState<Record<number, string>>({});
    const [loadingReceipt, setLoadingReceipt] = useState<number | null>(null);

    const handleDownloadReceipt = async (filingId: number, sessionId: string | null) => {
        if (!sessionId) return;

        // If we already have the URL, open it
        if (receiptUrls[filingId]) {
            window.open(receiptUrls[filingId], '_blank');
            return;
        }

        setLoadingReceipt(filingId);
        try {
            const url = await getPaymentReceiptUrl(sessionId);
            if (url) {
                setReceiptUrls(prev => ({ ...prev, [filingId]: url }));
                window.open(url, '_blank');
            } else {
                alert("Receipt not found or not ready yet.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to fetch receipt.");
        } finally {
            setLoadingReceipt(null);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <History className="w-4 h-4" /> History
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{businessName} - Filing History</DialogTitle>
                    <DialogDescription>
                        View past annual reports and download receipts.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-md border mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Year</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Filed</TableHead>
                                <TableHead>Orign</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No filings recorded.
                                    </TableCell>
                                </TableRow>
                            ) : filings.map((filing) => (
                                <TableRow key={filing.id}>
                                    <TableCell className="font-medium">{filing.year}</TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                            ${filing.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                                filing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    filing.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {filing.status}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(filing.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        Business Annual Report Filing
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {filing.sunbizReceiptUrl && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={filing.sunbizReceiptUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-3 h-3 mr-1" /> Filing
                                                </a>
                                            </Button>
                                        )}
                                        {filing.stripeSessionId && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadReceipt(filing.id, filing.stripeSessionId)}
                                                disabled={loadingReceipt === filing.id}
                                            >
                                                <FileText className="w-3 h-3 mr-1" />
                                                {loadingReceipt === filing.id ? "Loading..." : "Receipt"}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
