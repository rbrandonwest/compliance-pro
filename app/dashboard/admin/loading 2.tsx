import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AdminDashboardLoading() {
    return (
        <div className="min-h-screen bg-muted/10 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
                    </div>
                </header>

                <div className="h-12 w-64 bg-muted animate-pulse rounded-lg" />

                <div className="h-10 w-72 bg-muted animate-pulse rounded" />

                <Card>
                    <CardHeader>
                        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                                    <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                                    <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                                    <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                    <div className="h-8 w-32 bg-muted animate-pulse rounded ml-auto" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
