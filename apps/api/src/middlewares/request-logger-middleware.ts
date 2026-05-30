import { createMiddleware } from "hono/factory"
import { logger } from "../utils/logger"

export const requestLogger = createMiddleware(async (c, next) => {
  const url = new URL(c.req.url)
  const path = url.pathname + url.search

  logger.debug(`-> ${c.req.method} ${path}`)

  await next()

  const color = c.res.status >= 200 && c.res.status < 300 ? "\x1b[32m" : "\x1b[31m" // green for OK, red for others
  const reset = "\x1b[0m"

  logger.debug(`<- ${color}${c.res.status}${reset} ${c.req.method} ${path}`)
})
