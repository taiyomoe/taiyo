import { expect, test } from "@playwright/test"

test("pages refuse to be framed by another site", async ({ request }) => {
  const response = await request.get("/")

  expect(response.headers()["content-security-policy"]).toBe("frame-ancestors 'none'")
  expect(response.headers()["x-frame-options"]).toBe("DENY")
})
