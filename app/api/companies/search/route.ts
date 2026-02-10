import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_SEARCH_REQUESTS = 30;

function isSearchRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }

    entry.count++;
    return entry.count > MAX_SEARCH_REQUESTS;
}

export async function GET(request: Request) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    if (isSearchRateLimited(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] })
    }

    try {
        // Move active filter, ordering, and limit into the SQL query
        // so we avoid fetching excess rows and processing in memory
        const results = await prisma.$queryRaw<{ documentNumber: string; companyName: string; active: boolean }[]>`
            SELECT "documentNumber", "companyName", "active"
            FROM "BusinessDocument"
            WHERE lower("companyName") LIKE ${query.toLowerCase() + '%'}
              AND "active" = true
            ORDER BY "companyName" ASC
            LIMIT 10;
        `;

        const formattedResults = results.map(doc => ({
            ...doc,
            status: "Active"
        }))

        return NextResponse.json({ results: formattedResults })
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
