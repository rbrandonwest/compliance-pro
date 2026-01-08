"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export function StatusBadge({ docId, initialStatus, needsFiling }: { docId: string, initialStatus: string, needsFiling: boolean }) {
    const [status, setStatus] = useState(initialStatus)
    const [isPolling, setIsPolling] = useState(false)

    // Start polling if we are in a transitory state or if "PROCESSING"
    useEffect(() => {
        if (status === 'PAID' || status === 'PROCESSING') {
            setIsPolling(true);
        }
    }, [status]);

    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/filing/${docId}/status`);
                const data = await res.json();
                if (data.status !== status) {
                    setStatus(data.status);
                    if (data.status === 'SUCCESS' || data.status === 'FAILED') {
                        setIsPolling(false);
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isPolling, docId, status]);

    if (status === 'PROCESSING' || status === 'PAID') {
        return <Badge className="bg-blue-500 flex gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing...</Badge>
    }

    if (status === 'SUCCESS') {
        return <Badge className="bg-green-600 flex gap-1"><CheckCircle className="w-3 h-3" /> Filed Successfully</Badge>
    }

    if (status === 'FAILED') {
        return <Badge className="bg-red-600 flex gap-1"><XCircle className="w-3 h-3" /> Failed</Badge>
    }

    // Default Fallback
    return (
        <Badge variant={needsFiling ? "destructive" : "default"} className={needsFiling ? "bg-red-500" : "bg-green-500"}>
            {needsFiling ? "Filing Due" : "Compliant"}
        </Badge>
    )
}
