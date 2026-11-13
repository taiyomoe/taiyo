import { randomInt } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { test } from "../setup"

describe("POST /api/auth/update-user", () => {
  test("is disabled in favour of the profile routes", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const res = await app.request("/api/auth/update-user", {
      method: "POST",
      headers: {
        ...headers,
        origin: "http://localhost",
        "content-type": "application/json",
        "x-forwarded-for": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
      },
      body: JSON.stringify({ displayUsername: "test admin", image: "https://example.com/a.png" }),
    })

    expect(res.status).toBe(404)

    const user = await services.db
      .selectFrom("users")
      .select(["displayUsername", "image"])
      .where("id", "=", userId)
      .executeTakeFirstOrThrow()

    expect(user.displayUsername).not.toBe("test admin")
    expect(user.image).toBeNull()
  })
})
