import { describe, expect } from "vitest"
import { signInAs } from "./helpers/auth"
import { test } from "./setup"

describe("Origin check on state-changing requests", () => {
  test("refuses a browser request from another site, even as text/plain", async ({
    app,
    services,
  }) => {
    const follower = await signInAs(services)
    const followed = await signInAs(services)
    const follow = (origin?: string) =>
      app.request(`/users/${followed.userId}/follow`, {
        method: "POST",
        headers: {
          ...follower.headers,
          "content-type": "text/plain",
          ...(origin === undefined ? {} : { origin }),
        },
      })

    expect((await follow("http://evil.taiyo.test")).status).toBe(403)
    expect((await follow("null")).status).toBe(403)

    const follows = () =>
      services.db
        .selectFrom("userFollows")
        .select("followerId")
        .where("followerId", "=", follower.userId)
        .execute()

    expect(await follows()).toHaveLength(0)
    expect((await follow("http://localhost")).status).toBe(201)
    expect(await follows()).toHaveLength(1)
  })

  test("leaves requests without an Origin, such as server-side rendering, alone", async ({
    app,
    services,
  }) => {
    const follower = await signInAs(services)
    const followed = await signInAs(services)
    const res = await app.request(`/users/${followed.userId}/follow`, {
      method: "POST",
      headers: follower.headers,
    })

    expect(res.status).toBe(201)
  })
})
