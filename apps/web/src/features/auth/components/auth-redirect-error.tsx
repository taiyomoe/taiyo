import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useLocation, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"
import { getSocialErrorMessage } from "@/lib/auth"

// Better Auth sends a failed redirect back with ?error=: an expired verification link, a
// cancelled email change, a provider that could not be linked. The auth pages show it inline.
export function AuthRedirectError() {
  const router = useRouter()
  const { pathname, searchStr, hash } = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(searchStr)
    const code = params.get("error")

    if (code === null || pathname.startsWith("/auth")) {
      return
    }

    // The id makes a second run of this effect update the toast instead of stacking another one.
    toastManager.add({
      id: `auth-redirect-${code}`,
      title: getSocialErrorMessage(code, undefined),
      type: "error",
    })
    params.delete("error")

    const search = params.size === 0 ? "" : `?${params.toString()}`

    router.history.replace(`${pathname}${search}${hash === "" ? "" : `#${hash}`}`)
  }, [router, pathname, searchStr, hash])

  return null
}
