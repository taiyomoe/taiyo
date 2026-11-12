import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import {
  getNotificationStreamUrl,
  notificationKeys,
} from "@/features/notifications/api/notifications"
import { syncPushSubscription } from "@/features/notifications/lib/push"

const LOCK_NAME = "taiyo:notification-stream"
const CHANNEL_NAME = "taiyo:notifications"
const REFRESH_DELAY_MS = 400

/**
 * Keeps the notification queries fresh while the user is signed in. One tab holds the
 * server-sent events connection (a Web Lock elects it) and relays each change to the
 * other tabs, so many open tabs never exhaust the browser's per-origin connections.
 */
export function NotificationStream() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const controller = new AbortController()
    const channel = new BroadcastChannel(CHANNEL_NAME)
    let timer: ReturnType<typeof setTimeout> | undefined
    // A burst of upvotes or follows sends many changes: refetch once it settles.
    const refresh = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      }, REFRESH_DELAY_MS)
    }
    const lead = () =>
      new Promise<void>((resolve) => {
        if (controller.signal.aborted) {
          resolve()

          return
        }

        const source = new EventSource(getNotificationStreamUrl(), { withCredentials: true })

        source.addEventListener("ready", refresh)
        source.addEventListener("change", () => {
          refresh()
          channel.postMessage("change")
        })
        controller.signal.addEventListener("abort", () => {
          source.close()
          resolve()
        })
      })

    channel.addEventListener("message", refresh)
    syncPushSubscription().catch(() => {})

    if ("locks" in navigator) {
      navigator.locks.request(LOCK_NAME, { signal: controller.signal }, lead).catch(() => {})
    } else {
      void lead()
    }

    return () => {
      clearTimeout(timer)
      controller.abort()
      channel.close()
    }
  }, [queryClient])

  return null
}
