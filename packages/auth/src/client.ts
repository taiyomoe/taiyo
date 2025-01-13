import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { type BetterFetchError, createAuthClient } from "better-auth/react"
import type { Session, auth } from "./config"

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
})

export const useSession = authClient.useSession as () => {
  data: Session | null
  isPending: boolean
  error: BetterFetchError | null
}
