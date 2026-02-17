"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteFiling } from "@/app/actions/admin"

export function DeleteFilingButton({ filingId, businessName }: { filingId: number; businessName: string }) {
    const [confirming, setConfirming] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteFiling(filingId)
        } catch (error) {
            console.error("Failed to delete filing:", error)
            setIsDeleting(false)
            setConfirming(false)
        }
    }

    if (confirming) {
        return (
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Are you sure?</span>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-7 text-xs px-2"
                >
                    {isDeleting ? "Deleting..." : "Yes, delete"}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirming(false)}
                    disabled={isDeleting}
                    className="h-7 text-xs px-2"
                >
                    Cancel
                </Button>
            </div>
        )
    }

    return (
        <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirming(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
            <Trash2 className="w-4 h-4" />
        </Button>
    )
}
