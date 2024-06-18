import { ChapterUtils } from "@taiyomoe/utils"
import { type NextRequest, NextResponse } from "next/server"

export default function middleware(req: NextRequest) {
  const parsedUrl = ChapterUtils.parseUrl(req.nextUrl.pathname)

  if (!parsedUrl.currentPageNumber) {
    return NextResponse.redirect(new URL(`${parsedUrl.rawPathname}/1`, req.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/chapter/:path*"],
}
