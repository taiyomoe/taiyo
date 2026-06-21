import {
  adminClient,
  customSessionClient,
  magicLinkClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { Auth } from "./config"
import { clientEnv } from "./env/client"

export const authClient = createAuthClient({
  baseURL: clientEnv.VITE_BETTER_AUTH_URL,
  plugins: [usernameClient(), magicLinkClient(), customSessionClient<Auth>(), adminClient()],
})
