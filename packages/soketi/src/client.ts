import PusherClient from "pusher-js"
import { env } from "../env"

export const pusherClient = new PusherClient(env.NEXT_PUBLIC_SOKETI_APP_KEY, {
  wsHost: env.NEXT_PUBLIC_SOKETI_HOST,
  wsPort: env.NEXT_PUBLIC_SOKETI_PORT,
  forceTLS: false,
  enabledTransports: ["ws"],
  cluster: "local",
})
