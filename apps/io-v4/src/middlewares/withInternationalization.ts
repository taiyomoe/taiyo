import messages from "@taiyomoe/messages/en.json"
import type { InferNestedPaths } from "@taiyomoe/types"
import { createMiddleware } from "hono/factory"
import { createTranslator } from "use-intl"

const t = createTranslator({
  locale: "en",
  namespace: "api",
  messages,
})<InferNestedPaths<(typeof messages)["api"]>>

export const withInternationalization = createMiddleware<{
  Variables: {
    t: typeof t
  }
}>(async (c, next) => {
  c.set("t", t)

  await next()
})
