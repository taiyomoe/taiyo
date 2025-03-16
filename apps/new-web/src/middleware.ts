import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "~/utils/get-session"

export default async function middleware(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const session = await getSession()

  console.log("session", session)

  // User trying to access auth-related routes while logged in
  if (req.nextUrl.pathname.startsWith("/auth/") && session) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Intercept better-auth API errors and redirect to the custom auth error page
  if (req.nextUrl.pathname.startsWith("/api/auth/error")) {
    const errorCode = searchParams.get("error")

    return NextResponse.redirect(
      new URL(`/auth/error?code=${errorCode}`, req.url),
    )
  }

  return NextResponse.next()
}

export const config = {
  runtime: "nodejs",
  matcher: ["/auth/:path*", "/api/auth/error"],
}
