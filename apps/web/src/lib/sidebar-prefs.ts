import { readSidebarCookies } from "@taiyomoe/ui/components/ui/sidebar"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeader } from "@tanstack/react-start/server"

export const getSidebarPrefs = createIsomorphicFn()
  .server(() => readSidebarCookies(getRequestHeader("cookie") ?? ""))
  .client(() => readSidebarCookies(document.cookie))
