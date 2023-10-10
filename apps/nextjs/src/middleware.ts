import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { MediaChapterUtils } from "./utils/MediaChapterUtils";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const parsedUrl = MediaChapterUtils.parseUrl(request.nextUrl.pathname);

  if (!parsedUrl.currentPageNumber) {
    return NextResponse.redirect(
      new URL(parsedUrl.rawPathname + "/1", request.url),
    );
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/chapter/:path*",
};
