import {
  adminClient,
  customSessionClient,
  magicLinkClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { auth } from "./config"

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    magicLinkClient(),
    customSessionClient<typeof auth>(),
    adminClient(),
  ],
})
