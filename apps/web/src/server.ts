import handler from "@tanstack/react-start/server-entry"
import { paraglideMiddleware } from "@/paraglide/server"

export default {
  fetch: async (request: Request) => {
    const rendered = await paraglideMiddleware(request, (context) => handler.fetch(context.request))
    // A copy: a redirect's headers can be immutable.
    const response = new Response(rendered.body, rendered)

    // No other site may frame a page: the frame would carry the visitor's session, and clicks
    // lured onto it would act as them.
    response.headers.set("Content-Security-Policy", "frame-ancestors 'none'")
    response.headers.set("X-Frame-Options", "DENY")

    // A rendered page embeds the visitor's session: a shared cache must never store it. Routes
    // that serve the same response to everyone, such as the OG images, set their own.
    if (!response.headers.has("Cache-Control")) {
      response.headers.set("Cache-Control", "private, no-store")
    }

    return response
  },
}
