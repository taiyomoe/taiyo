import { authClient } from "@taiyomoe/auth/client"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { disablePush } from "@/features/notifications/lib/push"
import { clearOfflineChapters } from "@/features/offline/hooks/use-offline-chapters"
import { createAuthActions } from "@/lib/auth"

export const useAuthActions = (callbackURL?: string) => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const actions = createAuthActions({
    client: authClient,
    queryClient,
    router: {
      invalidate: () => router.invalidate(),
      navigate: (options) => router.navigate(options),
    },
    callbackURL,
  })

  return {
    ...actions,
    signOut: async () => {
      await Promise.all([disablePush().catch(() => {}), clearOfflineChapters().catch(() => {})])

      return actions.signOut()
    },
  }
}
