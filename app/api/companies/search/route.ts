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
                    startsWith: query.toUpperCase(), // Best for index usage
                    mode: 'insensitive',
                },
                active: true, // Only show active companies? Or irrelevant? User didn't specify, but safer to find all.
            },
            take: 10,
            select: {
                documentNumber: true,
                companyName: true,
                active: true, // User might want to see if it's active
            },
            orderBy: {
                companyName: 'asc',
            },
        })

        // If startsWith yields too few results, fallback to contains? 
        // For large datasets, contains is slow (scan). Stick to startsWith for now.

        const formattedResults = results.map(doc => ({
            ...doc,
            status: doc.active ? "Active" : "Inactive"
            // Let's check schema. `active` is boolean.
        }))

        return NextResponse.json({ results: formattedResults })
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
