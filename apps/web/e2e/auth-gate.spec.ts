import { expect, test } from "@playwright/test"

const MEDIA = "11616192-2351-4e1e-8d70-3bf7908b796c"

test.use({ storageState: { cookies: [], origins: [] } })

test("signed-out visitors are sent to sign in, then back to the page", async ({ request }) => {
  for (const path of ["/changelog", "/groups", "/rankings", `/media/${MEDIA}`, "/missing-page"]) {
    const response = await request.get(path, { maxRedirects: 0 })

    expect(response.status()).toBe(307)
    expect(response.headers().location).toBe(`/auth/sign-in?redirect=${encodeURIComponent(path)}`)
  }
})

test("the landing, auth and legal pages stay public", async ({ request }) => {
  for (const path of ["/", "/auth/sign-in", "/auth/sign-up", "/terms", "/privacy", "/dmca"]) {
    expect((await request.get(path, { maxRedirects: 0 })).status()).toBe(200)
  }
})

test("link-preview crawlers get only a page's preview tags", async ({ request }) => {
  const response = await request.get(`/media/${MEDIA}`, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)" },
    maxRedirects: 0,
  })
  const html = await response.text()

  expect(response.status()).toBe(200)
  expect(html).toContain('<meta property="og:title" content="Hako Girl">')
  expect(html).toContain(`<meta property="og:image" content="http://localhost:`)
  expect(html).toContain(`/og/media/${MEDIA}">`)
  expect(html).not.toContain("<script")
})
