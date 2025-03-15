import { type NextRequest, NextResponse } from "next/server"

export default function middleware(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  if (req.nextUrl.pathname.startsWith("/api/auth/error")) {
    const errorCode = searchParams.get("error")

    return NextResponse.redirect(
      new URL(`/auth/error?code=${errorCode}`, req.url),
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/auth/error"],
}
