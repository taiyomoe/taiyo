import PusherServer from "pusher"
import { env } from "../env"

export const pusherServer = new PusherServer({
  host: env.NEXT_PUBLIC_SOKETI_HOST,
  port:
    process.env.NODE_ENV !== "production"
      ? String(env.NEXT_PUBLIC_SOKETI_PORT)
      : undefined,
  appId: env.SOKETI_APP_ID,
  key: env.NEXT_PUBLIC_SOKETI_APP_KEY,
  secret: env.SOKETI_APP_SECRET,
  useTLS: process.env.NODE_ENV === "production",
})
