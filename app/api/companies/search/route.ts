import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] })
    }

    try {
        // Use Raw SQL to guarantee usage of the 'lower(companyName)' index.
        // Prisma's 'mode: insensitive' can sometimes generate ILIKE which misses the functional index.
        const results = await prisma.$queryRaw<{ documentNumber: string; companyName: string; active: boolean }[]>`
            SELECT "documentNumber", "companyName", "active"
            FROM "BusinessDocument"
            WHERE lower("companyName") LIKE ${query.toLowerCase() + '%'}
            LIMIT 50;
        `;

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
