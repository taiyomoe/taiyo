import { cors } from "@elysiajs/cors"
import Stream from "@elysiajs/stream"
import { swagger } from "@elysiajs/swagger"
import { Elysia } from "elysia"
import { bannersController } from "./controllers/banners.controller"
import { coversController } from "./controllers/covers.controller"
import * as customErrors from "./utils/errors"

const buildResponse = (obj: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(obj), {
    headers: { "Content-Type": "application/json" },
    status,
  })

export const app = new Elysia({ prefix: "/v3" })
  .use(cors({ origin: true, allowedHeaders: ["Content-Type"] }))
  .use(swagger())
  .error({ ...customErrors })
  .mapResponse(({ response }) => {
    if (response && response instanceof Stream) {
      return
    }

    const data = (Array.isArray(response) ? response?.at(0) : response) || null
    const meta = Array.isArray(response) ? [response.at(1)] : []

    return buildResponse({ data, meta })
  })
  .onError(({ error, code }) => {
    switch (code) {
      case "UnauthorizedError":
      case "MediaNotFoundError":
      case "MediaTrackerNotFoundError":
      case "ScansNotFoundError":
      case "DuplicatedMediaTrackerError":
      case "InvalidFilesError":
        return buildResponse({ errors: [error.message] }, error.status)
      case "VALIDATION":
        return buildResponse({ errors: error.all }, 422)
      case "NOT_FOUND":
        return buildResponse({ errors: ["Resource not found"] }, 404)
      default:
        return buildResponse(
          { errors: ["An unexpected error occured. Please try again later"] },
          500,
        )
    }
  })
  .use(bannersController)
  .use(coversController)
  .get("/healthcheck", () => "OK")
  .listen(4000)

console.log(`Listening on http://localhost:${app.server!.port}`)
