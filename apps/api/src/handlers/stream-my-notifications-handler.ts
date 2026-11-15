import { Hono } from "hono"
import { describeRoute } from "hono-openapi"
import { streamSSE } from "hono/streaming"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"

const HEARTBEAT_MS = 25_000
const MAX_DURATION_MS = 30 * 60_000

export const streamMyNotificationsHandler = new Hono().get(
  "/me/notifications/stream",
  describeRoute({
    summary: "Stream changes to my notifications",
    description: `Streams changes to your notifications as server-sent events. A \`ready\` event arrives once the stream is open, then a \`change\` event whenever your notifications change (a new one, or one read from another tab), so you can fetch them again. A \`ping\` comment keeps the connection alive every ${HEARTBEAT_MS / 1000} seconds, and the stream closes after ${MAX_DURATION_MS / 60_000} minutes so your session is checked again when you reconnect.\n\n**Authentication:** signed-in user.`,
    tags: ["Notifications"],
    responses: {
      200: {
        description: "The event stream of your notification changes.",
        content: { "text/event-stream": { schema: { type: "string" } } },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth(),
  (c) => {
    const { user, notificationEvents } = c.var

    c.header("Cache-Control", "no-cache, no-transform")
    c.header("X-Accel-Buffering", "no")

    return streamSSE(c, async (stream) => {
      const unsubscribe = notificationEvents.subscribe(user.id, () => {
        void stream.writeSSE({ event: "change", data: "" })
      })
      const closeAt = Date.now() + MAX_DURATION_MS

      stream.onAbort(unsubscribe)
      await stream.writeSSE({ event: "ready", data: "", retry: 5000 })

      while (!stream.aborted && !stream.closed && Date.now() < closeAt) {
        await stream.sleep(HEARTBEAT_MS)
        await stream.write(": ping\n\n")
      }

      unsubscribe()
    })
  },
)
