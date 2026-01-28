import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] })
    }

    try {
        const results = await prisma.businessDocument.findMany({
            where: {
                companyName: {
                    startsWith: query, // Database index on LOWER() handles this now
                    mode: 'insensitive',
                },
                // Removed "active: true" to ensure index usage (avoid bitmap scan)
            },
            take: 50, // Fetch more candidates, filter in memory
            select: {
                documentNumber: true,
                companyName: true,
                active: true,
            },
            // Removed ORDER BY to ensure index usage
        })

        // Optimized In-Memory Processing
        const formattedResults = results
            .filter(doc => doc.active) // Filter for active companies in memory
            .sort((a, b) => a.companyName.localeCompare(b.companyName)) // Sort in memory
            .slice(0, 10) // Take top 10
            .map(doc => ({
                ...doc,
                status: "Active"
            }))

        return NextResponse.json({ results: formattedResults })
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
