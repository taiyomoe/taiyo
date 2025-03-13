import {
  adminClient,
  customSessionClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { auth } from "./config"

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    customSessionClient<typeof auth>(),
    adminClient(),
  ],
})
