import { auth } from "@taiyomoe/auth"
import { MediaChapterUtils } from "@taiyomoe/utils"
import { NextResponse } from "next/server"

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const user = req.auth?.user

  if (pathname.startsWith("/chapter")) {
    const parsedUrl = MediaChapterUtils.parseUrl(req.nextUrl.pathname)

    if (!parsedUrl.currentPageNumber) {
      return NextResponse.redirect(
        new URL(`${parsedUrl.rawPathname}/1`, req.url),
      )
    }
  }

  if (pathname.startsWith("/dashboard") && user?.role.name !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/chapter/:path*", "/dashboard/:path*"],
}
