import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { getBrandByHostname } from "./lib/brands"

const protectedPaths = ["/dashboard"]

export async function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || ""
    const brand = getBrandByHostname(hostname)

    const { pathname } = request.nextUrl

    // Auth protection for dashboard routes
    if (protectedPaths.some(p => pathname.startsWith(p))) {
        const token = await getToken({ req: request })
        if (!token) {
            const loginUrl = new URL("/login", request.url)
            loginUrl.searchParams.set("callbackUrl", pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

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
