import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function FilerDashboardLoading() {
    return (
        <div className="min-h-screen bg-muted/10 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
                    </div>
                    <div className="h-10 w-48 bg-muted animate-pulse rounded" />
                </header>

                <Card>
                    <CardHeader>
                        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                                    <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                                    <div className="h-4 w-20 bg-muted animate-pulse rounded ml-auto" />
                                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
