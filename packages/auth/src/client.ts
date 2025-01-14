import { adminClient, customSessionClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { auth } from "./config"

export const authClient = createAuthClient({
  plugins: [customSessionClient<typeof auth>(), adminClient()],
})
