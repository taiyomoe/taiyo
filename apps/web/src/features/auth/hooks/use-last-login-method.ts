import { authClient } from "@taiyomoe/auth/client"
import { noop } from "@tanstack/react-query"
import { useSyncExternalStore } from "react"

// The cookie is written by the auth API on sign-in and never changes while the
// auth screen is open, so there is nothing to subscribe to. The server snapshot
// is null so the badge only appears after hydration.
export const useLastLoginMethod = () =>
  useSyncExternalStore(
    () => noop,
    () => authClient.getLastUsedLoginMethod(),
    () => null,
  )
