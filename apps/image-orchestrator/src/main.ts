import { cors } from "@elysiajs/cors"
import Stream from "@elysiajs/stream"
import { swagger } from "@elysiajs/swagger"
import { Elysia, ValidationError } from "elysia"
import { chaptersController } from "~/controllers/chapters.controller"
import { mediasController } from "~/controllers/medias.controller"
import { bannersController } from "./controllers/banners.controller"
import { coversController } from "./controllers/covers.controller"

const app = new Elysia({ prefix: "/v3" })
  .use(cors())
  .use(swagger())
  .mapResponse(({ response }) => {
    if (response && response instanceof Stream) {
      return
    }

    const data = (Array.isArray(response) ? response?.at(0) : response) || null
    const meta = Array.isArray(response) ? [response.at(1)] : []

    return new Response(JSON.stringify({ data, meta }), {
      headers: { "Content-Type": "application/json" },
    })
  })
  .onError(({ error }) => {
    if (error instanceof ValidationError) {
      return new Response(JSON.stringify({ errors: error.all }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ errors: [error.message] }), {
      headers: { "Content-Type": "application/json" },
    })
  })
  .use(mediasController)
  .use(chaptersController)
  .use(bannersController)
  .use(coversController)
  .listen(4000)

console.log(`Listening on http://localhost:${app.server!.port}`)
