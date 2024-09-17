import { Hono } from "hono"
import { withInternationalization } from "./middlewares/withInternationalization"

const app = new Hono().use(withInternationalization)

app.get("/", (c) => {
  const msg = c.var.t("medias.notFound", { name: "taiyo" })

  return c.text(msg)
})

export default app
