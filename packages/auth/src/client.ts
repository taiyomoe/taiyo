import { createAuthClient } from "better-auth/client"
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./config"

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
})
