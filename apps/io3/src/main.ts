import "@bogeychan/elysia-polyfills/node/index.js"

import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { Elysia } from "elysia"
import { coversController } from "./controllers/covers.controller"

const app = new Elysia({ prefix: "/v3" })
  .use(cors())
  .use(swagger())
  .mapResponse(({ response }) => {
    const data = (Array.isArray(response) ? response?.at(0) : response) || null
    const meta = Array.isArray(response) ? [response.at(1)] : []

    return new Response(JSON.stringify({ data, meta }), {
      headers: {
        "Content-Type": "application/json",
      },
    })
  })
  .onError(({ error }) => {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
      },
    })
  })
  .use(coversController)
  .listen(4000)

console.log(`Listening on http://localhost:${app.server!.port}`)
