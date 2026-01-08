import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { deleteUser, updateUserRole, resetUserPassword } from "@/app/actions/admin"
import { SearchInput } from "@/components/dashboard/search-input"
import FilerDashboardPage from "../filer/page"

export default async function AdminDashboardPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const params = await searchParams;
    const query = params?.q || "";

    const users = await prisma.user.findMany({
        where: query ? {
            OR: [
                { email: { contains: query, mode: 'insensitive' } },
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } }
            ]
        } : {},
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { filings: true } } }
    });

    return (
        <div className="min-h-screen bg-muted/10 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">System Overview</p>
                    </div>
                </header>

                <Tabs defaultValue="filings" className="w-full">
                    <TabsList >
                        <TabsTrigger value="filings">Filing Queue</TabsTrigger>
                        <TabsTrigger value="users">User Management</TabsTrigger>
                    </TabsList>

                    <TabsContent value="filings">
                        <div className="mt-4">
                            <h3 className="text-lg font-medium mb-4">Master Filing Queue</h3>
                            <FilerDashboardPage searchParams={searchParams} />
                        </div>
                    </TabsContent>

                    <TabsContent value="users">
                        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap mb-4">
                            <h3 className="text-lg font-medium">All Users ({users.length})</h3>
                            <SearchInput placeholder="Search users..." />
                        </div>
                        <Card>
                            <CardHeader className="sr-only">
                                <CardTitle>User List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3">User</th>
                                                <th className="px-4 py-3">Role</th>
                                                <th className="px-4 py-3">Filings</th>
                                                <th className="px-4 py-3">Joined</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id} className="border-b">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{user.email}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline">{user.role}</Badge>
                                                    </td>
                                                    <td className="px-4 py-3">{user._count.filings}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right space-x-2">
                                                        <form action={async () => {
                                                            'use server';
                                                            const nextRole = user.role === 'CLIENT' ? 'FILER' : (user.role === 'FILER' ? 'ADMIN' : 'CLIENT');
                                                            await updateUserRole(user.id, nextRole as any);
                                                        }} className="inline">
                                                            <Button size="sm" variant="outline">Cycle Role</Button>
                                                        </form>

                                                        {/* Simple deletion form */}
                                                        <form action={async () => {
                                                            'use server';
                                                            if (user.role !== 'ADMIN') await deleteUser(user.id);
                                                        }} className="inline">
                                                            <Button size="sm" variant="destructive" disabled={user.role === 'ADMIN'}>Delete</Button>
                                                        </form>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
