"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"

export function StatusBadge({ docId, initialStatus, needsFiling }: { docId: string, initialStatus: string, needsFiling: boolean }) {
    const [status, setStatus] = useState(initialStatus)
    const [isPolling, setIsPolling] = useState(false)
    const statusRef = useRef(status)

    // Keep ref in sync with state to avoid stale closures
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Start polling if we are in a transitory state
    useEffect(() => {
        if (status === 'PAID' || status === 'PROCESSING' || status === 'PENDING') {
            setIsPolling(true);
        }
    }, [status]);

    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/filing/${docId}/status`);
                if (!res.ok) return;
                const data = await res.json();
                if (data.status !== statusRef.current) {
                    setStatus(data.status);
                    if (data.status === 'SUCCESS' || data.status === 'FAILED') {
                        setIsPolling(false);
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 5000); // 5 second polling interval

        return () => clearInterval(interval);
    }, [isPolling, docId]);

    if (status === 'PROCESSING' || status === 'PAID' || status === 'PENDING') {
        return <Badge className="bg-blue-500 flex gap-1"><Clock className="w-3 h-3" /> Pending</Badge>
    }

    if (status === 'SUCCESS') {
        return <Badge className="bg-green-600 flex gap-1"><CheckCircle className="w-3 h-3" /> Filed Successfully</Badge>
    }

    if (status === 'FAILED') {
        return <Badge className="bg-red-600 flex gap-1"><XCircle className="w-3 h-3" /> Failed</Badge>
    }

    if (status === 'MANUAL_REVIEW') {
        return <Badge className="bg-orange-500 flex gap-1">Under Review</Badge>
    }

    // Default Fallback
    return (
        <Badge variant={needsFiling ? "destructive" : "default"} className={needsFiling ? "bg-red-500" : "bg-green-500"}>
            {needsFiling ? "Filing Due" : "Compliant"}
        </Badge>
    )
}
