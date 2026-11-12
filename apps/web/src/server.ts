import handler from "@tanstack/react-start/server-entry"
import { paraglideMiddleware } from "@/paraglide/server"

export default {
  fetch: (request: Request) =>
    paraglideMiddleware(request, (context) => handler.fetch(context.request)),
}
