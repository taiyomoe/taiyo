import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { type ApiResult, api } from "../helpers/request"
import { test } from "../setup"

type Settings = Record<string, unknown>

const settingsOf = (res: ApiResult<{ settings: Settings | null }>) => {
  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data.settings
}

describe("/users/me/reader-settings", () => {
  test("returns null until settings are saved", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api<{ settings: Settings | null }>(app, "/users/me/reader-settings", {
      headers,
    })

    expect(res.status).toBe(200)
    expect(settingsOf(res)).toBeNull()
  })

  test("saves settings and fills invalid or missing ones with defaults", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services)
    const saved = await api<{ settings: Settings }>(app, "/users/me/reader-settings", {
      method: "PUT",
      headers,
      json: { mode: "double", brightness: 999, background: "#123abc", unknown: "dropped" },
    })

    expect(saved.status).toBe(200)

    const res = await api<{ settings: Settings | null }>(app, "/users/me/reader-settings", {
      headers,
    })
    const settings = settingsOf(res)

    expect(settings).toMatchObject({
      mode: "double",
      brightness: 100,
      background: "#123abc",
      longStripMode: "strip",
    })
    expect(settings).not.toHaveProperty("unknown")
  })

  test("keeps each account's settings apart", async ({ app, services }) => {
    const first = await signInAs(services)
    const second = await signInAs(services)

    await api(app, "/users/me/reader-settings", {
      method: "PUT",
      headers: first.headers,
      json: { direction: "rtl" },
    })

    const res = await api<{ settings: Settings | null }>(app, "/users/me/reader-settings", {
      headers: second.headers,
    })

    expect(settingsOf(res)).toBeNull()
  })

  test("rejects a body that is not an object", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/reader-settings", {
      method: "PUT",
      headers,
      json: ["single"],
    })

    expect(res.status).toBe(422)
  })

  test("requires a signed-in user", async ({ app }) => {
    const res = await api(app, "/users/me/reader-settings")

    expect(res.status).toBe(401)
  })
})
