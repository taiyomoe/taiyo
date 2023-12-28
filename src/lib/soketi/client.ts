import PusherClient from "pusher-js"

import { env } from "~/lib/env.mjs"

export const pusherClient = new PusherClient(
  // This hard-coded string fallback is needed so that Pusher stops complaining when the app is building
  env.NEXT_PUBLIC_SOKETI_APP_KEY ?? "",
  {
    wsHost: env.NEXT_PUBLIC_SOKETI_HOST,
    wsPort: env.NEXT_PUBLIC_SOKETI_PORT,
    forceTLS: false,
    enabledTransports: ["ws"],
    cluster: "local",
  },
)
