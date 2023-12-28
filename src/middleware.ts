import { withAuth } from "next-auth/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { MediaChapterUtils } from "./lib/utils/mediaChapter.utils"
import { PermissionUtils } from "./lib/utils/permissions.utils"

const chapterMiddleware = (req: NextRequest) => {
  const parsedUrl = MediaChapterUtils.parseUrl(req.nextUrl.pathname)

  if (!parsedUrl.currentPageNumber) {
    return NextResponse.redirect(new URL(`${parsedUrl.rawPathname}/1`, req.url))
  }

  return NextResponse.next()
}

export default withAuth(
  (req: NextRequest) => {
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith("/chapter/")) {
      return chapterMiddleware(req)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname

        if (pathname.startsWith("/chapter/")) {
          return true
        }

        if (!token) {
          return false
        }

        switch (true) {
          case pathname === "/dashboard":
            return PermissionUtils.canAccessDashboard(token.role.permissions)
          case pathname === "/dashboard/medias/import":
            return token.role.permissions.includes("medias:create")
          case pathname === "/dashboard/medias/add":
            return token.role.permissions.includes("medias:create")
          case pathname.startsWith("/dashboard/medias/edit"):
            return token.role.permissions.includes("medias:update:any")
          case pathname === "/dashboard/chapters/add":
            return token.role.permissions.includes("mediaChapters:create")
          case pathname === "/dashboard/chapters/bulk-upload":
            return token.role.permissions.includes("mediaChapters:create")
          case pathname.startsWith("/dashboard/chapters/edit"):
            return token.role.permissions.includes("mediaChapters:update:any")
          case pathname === "/dashboard/scans/add":
            return token.role.permissions.includes("scans:create")
          default:
            return false
        }
      },
    },
  },
)

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/chapter/:path*", "/dashboard/:path*"],
}
