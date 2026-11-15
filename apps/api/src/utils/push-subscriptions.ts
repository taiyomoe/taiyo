import z from "zod"

export const pushEndpointSchema = z
  .url({ protocol: /^https$/ })
  .max(2048)
  .meta({
    description: "The push service URL the browser handed out for this device.",
    example: "https://fcm.googleapis.com/fcm/send/c8p5…",
  })
