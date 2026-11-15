import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type Settings = {
  contentRating?: string[]
  latestUpdatesLayout?: string
  showLibrary?: boolean
}

describe("PATCH /users/me/settings", () => {
  test("requires a signed-in user", async ({ app }) => {
    const res = await api(app, "/users/me/settings", {
      method: "PATCH",
      json: { contentRating: ["NORMAL"] },
    })

    expect(res.status).toBe(401)
  })

  test("stores the content ratings in canonical order", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const res = await api<Settings>(app, "/users/me/settings", {
      method: "PATCH",
      headers,
      json: { contentRating: ["NSFW", "NORMAL", "NSFW"] },
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.contentRating).toEqual(["NORMAL", "NSFW"])

    const user = await services.db
      .selectFrom("users")
      .select("settings")
      .where("id", "=", userId)
      .executeTakeFirstOrThrow()

    expect(user.settings.contentRating).toEqual(["NORMAL", "NSFW"])
  })

  test("leaves the other settings untouched", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)

    await services.db
      .updateTable("users")
      .set({ settings: { showLibrary: false, contentRating: ["NORMAL"] } })
      .where("id", "=", userId)
      .execute()

    const res = await api<Settings>(app, "/users/me/settings", {
      method: "PATCH",
      headers,
      json: { latestUpdatesLayout: "GRID" },
    })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      showLibrary: false,
      contentRating: ["NORMAL"],
      latestUpdatesLayout: "GRID",
    })
  })

  test("rejects an empty content rating list", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/settings", {
      method: "PATCH",
      headers,
      json: { contentRating: [] },
    })

    expect(res.status).toBe(422)
  })

  test("rejects an unknown layout", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/settings", {
      method: "PATCH",
      headers,
      json: { latestUpdatesLayout: "MASONRY" },
    })

    expect(res.status).toBe(422)
  })

  test("is reflected in the session", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    await api(app, "/users/me/settings", {
      method: "PATCH",
      headers,
      json: { contentRating: ["NSFL"] },
    })

    const session = await services.auth.api.getSession({ headers: new Headers(headers) })

    expect(session?.user.settings.contentRating).toEqual(["NSFL"])
  })
})
