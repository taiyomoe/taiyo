import { expect, test } from "@playwright/test"

test("pages refuse to be framed by another site", async ({ request }) => {
  const response = await request.get("/")

  expect(response.headers()["content-security-policy"]).toBe("frame-ancestors 'none'")
  expect(response.headers()["x-frame-options"]).toBe("DENY")
})

test("rendered pages stay out of shared caches, even at a static-looking path", async ({
  request,
}) => {
  for (const path of ["/", "/missing-page.css"]) {
    const response = await request.get(path)

    expect(response.headers()["cache-control"]).toBe("private, no-store")
  }
})
