import { authClient } from "@taiyomoe/auth/client"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { createAuthActions } from "@/lib/auth"

export const useAuthActions = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return createAuthActions({
    client: authClient,
    queryClient,
    router: {
      invalidate: () => router.invalidate(),
      navigate: (options) => router.navigate(options),
    },
  })
}
