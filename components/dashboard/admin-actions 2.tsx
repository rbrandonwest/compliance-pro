"use client";

import { Button } from "@/components/ui/button";
import { updateUserRole, deleteUser } from "@/app/actions/admin";
import { useState } from "react";

interface AdminActionsProps {
    userId: string;
    userRole: string;
    userEmail: string;
}

export function AdminActions({ userId, userRole, userEmail }: AdminActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCycling, setIsCycling] = useState(false);

    const handleCycleRole = async () => {
        const nextRole = userRole === 'CLIENT' ? 'FILER' : (userRole === 'FILER' ? 'ADMIN' : 'CLIENT');
        const confirmed = window.confirm(
            `Change ${userEmail}'s role from ${userRole} to ${nextRole}?`
        );
        if (!confirmed) return;

        setIsCycling(true);
        try {
            await updateUserRole(userId, nextRole as 'ADMIN' | 'FILER' | 'CLIENT');
        } catch (err) {
            console.error("Failed to update role:", err);
        } finally {
            setIsCycling(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${userEmail}? This will permanently remove all their filings and data. This action cannot be undone.`
        );
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            await deleteUser(userId);
        } catch (err) {
            console.error("Failed to delete user:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Button
                size="sm"
                variant="outline"
                onClick={handleCycleRole}
                disabled={isCycling}
            >
                {isCycling ? "Updating..." : "Cycle Role"}
            </Button>
            <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={userRole === 'ADMIN' || isDeleting}
            >
                {isDeleting ? "Deleting..." : "Delete"}
            </Button>
        </>
    );
}
