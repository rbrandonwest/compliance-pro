import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ClientDashboardLoading() {
    return (
        <div className="min-h-screen bg-muted/10 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
                    </div>
                    <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                </header>

                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                                <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center gap-4 mt-2">
                                    <div className="space-y-2">
                                        <div className="h-4 w-36 bg-muted animate-pulse rounded" />
                                        <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                                    </div>
                                    <div className="h-10 w-36 bg-muted animate-pulse rounded" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
