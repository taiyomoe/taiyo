import {
  adminClient,
  customSessionClient,
  magicLinkClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { Auth } from "./config"

export const authClient = createAuthClient({
  plugins: [usernameClient(), magicLinkClient(), customSessionClient<Auth>(), adminClient()],
})
