import { isPushServiceEndpoint } from "@taiyomoe/queue"
import z from "zod"

export const pushEndpointSchema = z
  .url({ protocol: /^https$/ })
  .max(2048)
  .refine(isPushServiceEndpoint, { message: "The endpoint is not on a known push service." })
  .meta({
    description:
      "The push service URL the browser handed out for this device. Only the push services of Chrome, Firefox, Edge and Safari are accepted.",
    example: "https://fcm.googleapis.com/fcm/send/c8p5…",
  })
