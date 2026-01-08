import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getBrandByHostname } from "./lib/brands"

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || ""
    const brand = getBrandByHostname(hostname)

    const response = NextResponse.next()
    response.headers.set("x-brand", brand.id)

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
