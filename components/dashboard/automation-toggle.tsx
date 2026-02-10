"use client";

import { Button } from "@/components/ui/button";
import { toggleAutomation } from "@/app/actions/admin";
import { useState } from "react";
import { Zap, ZapOff } from "lucide-react";

interface AutomationToggleProps {
    initialEnabled: boolean;
}

export function AutomationToggle({ initialEnabled }: AutomationToggleProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        const action = enabled ? "disable" : "enable";
        const confirmed = window.confirm(
            `Are you sure you want to ${action} automation? ${enabled ? "New filings will be routed to manual review." : "New filings will be processed automatically."}`
        );
        if (!confirmed) return;

        setIsToggling(true);
        try {
            const result = await toggleAutomation();
            setEnabled(result.enabled);
        } catch (err) {
            console.error("Failed to toggle automation:", err);
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${enabled ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            {enabled ? (
                <Zap className="w-5 h-5 text-green-600" />
            ) : (
                <ZapOff className="w-5 h-5 text-orange-600" />
            )}
            <div className="flex-1">
                <div className="text-sm font-medium">
                    Automation {enabled ? "Enabled" : "Disabled"}
                </div>
                <div className="text-xs text-muted-foreground">
                    {enabled ? "Filings are processed automatically." : "Filings require manual review."}
                </div>
            </div>
            <Button
                size="sm"
                variant={enabled ? "outline" : "default"}
                onClick={handleToggle}
                disabled={isToggling}
            >
                {isToggling ? "..." : enabled ? "Disable" : "Enable"}
            </Button>
        </div>
    );
}
