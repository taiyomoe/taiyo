import PusherServer from "pusher";

import { env } from "~/lib/env.mjs";

export const pusherServer = new PusherServer({
  host: env.NEXT_PUBLIC_SOKETI_HOST,
  port: env.NEXT_PUBLIC_SOKETI_PORT.toString(),
  appId: env.SOKETI_APP_ID,
  key: env.NEXT_PUBLIC_SOKETI_APP_KEY,
  secret: env.SOKETI_APP_SECRET,
});
