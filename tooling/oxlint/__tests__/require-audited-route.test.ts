import { RuleTester } from "oxlint/plugins-dev"
import { describe, it } from "vitest"
import plugin from "../plugin"

// oxlint-disable-next-line typescript/strict-void-return
RuleTester.describe = describe
RuleTester.it = it

new RuleTester().run("require-audited-route", plugin.rules["require-audited-route"], {
  valid: [
    'new Hono().post("/", describeRoute({}), audited(mediaAudit.CREATE), withAuth("create", "Media"), handler)',
    'new Hono().delete("/:id", audited(mediaAudit.DELETE, (c) => ({ id: c.req.param("id") })), handler)',
    'new Hono().get("/", handler)',
    'new Hono().route("/", child)',
    'app.post("/", handler)',
  ],
  invalid: [
    {
      code: 'new Hono().post("/", describeRoute({}), withAuth("create", "Media"), handler)',
      errors: [{ messageId: "unaudited" }],
    },
    {
      code: 'new Hono().patch("/:id", handler)',
      errors: [{ messageId: "unaudited" }],
    },
    {
      code: 'new Hono().put("/:id", audit(mediaAudit.UPDATE), handler)',
      errors: [{ messageId: "unaudited" }],
    },
  ],
})
