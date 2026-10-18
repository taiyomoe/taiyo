import { ROLES, type Role } from "@taiyomoe/permissions"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type Route = {
  method: "GET" | "POST" | "PATCH" | "DELETE"
  path: string
  body?: "json" | "form"
  allowed: readonly Role[]
}

const id = randomUUID()
const MEDIA_EDITORS = ["UPLOADER_INTERN", "UPLOADER", "MODERATOR", "ADMIN"] as const
const ROUTES: Route[] = [
  {
    method: "POST",
    path: "/medias",
    body: "form",
    allowed: ["UPLOADER_INTERN", "UPLOADER", "ADMIN"],
  },
  { method: "PATCH", path: `/medias/${id}`, body: "json", allowed: MEDIA_EDITORS },
  { method: "POST", path: `/medias/${id}/covers`, body: "form", allowed: MEDIA_EDITORS },
  { method: "POST", path: `/medias/${id}/banners`, body: "form", allowed: MEDIA_EDITORS },
  { method: "POST", path: `/medias/${id}/staffs`, body: "json", allowed: MEDIA_EDITORS },
  { method: "DELETE", path: `/medias/${id}/staffs/${id}/AUTHOR`, allowed: MEDIA_EDITORS },
  { method: "POST", path: `/covers/${id}/set-main`, allowed: MEDIA_EDITORS },
  { method: "PATCH", path: `/covers/${id}`, body: "json", allowed: MEDIA_EDITORS },
  { method: "DELETE", path: `/covers/${id}`, allowed: MEDIA_EDITORS },
  { method: "PATCH", path: `/banners/${id}`, body: "json", allowed: MEDIA_EDITORS },
  { method: "DELETE", path: `/banners/${id}`, allowed: MEDIA_EDITORS },
  { method: "DELETE", path: `/medias/${id}`, allowed: ["UPLOADER", "ADMIN"] },
  { method: "POST", path: `/medias/${id}/flag`, body: "json", allowed: ["MODERATOR", "ADMIN"] },
  { method: "POST", path: `/medias/${id}/restore`, allowed: ["ADMIN"] },
  { method: "POST", path: `/medias/${id}/reindex`, allowed: ["ADMIN"] },
  {
    method: "POST",
    path: "/staffs",
    body: "form",
    allowed: ["UPLOADER_INTERN", "UPLOADER", "ADMIN"],
  },
  { method: "PATCH", path: `/staffs/${id}`, body: "form", allowed: MEDIA_EDITORS },
  { method: "DELETE", path: `/staffs/${id}`, allowed: ["UPLOADER", "ADMIN"] },
  { method: "POST", path: "/groups", body: "json", allowed: ["UPLOADER", "ADMIN"] },
  { method: "DELETE", path: `/groups/${id}`, allowed: ["ADMIN"] },
  { method: "POST", path: `/groups/${id}/members`, body: "json", allowed: ["ADMIN"] },
  { method: "POST", path: `/groups/${id}/ownership-requests`, body: "json", allowed: ROLES },
  { method: "POST", path: `/ownership-requests/${id}/approve`, allowed: ["ADMIN"] },
  { method: "POST", path: `/ownership-requests/${id}/reject`, body: "json", allowed: ["ADMIN"] },
  { method: "GET", path: "/dashboard/overview?range=forever", allowed: ["MODERATOR", "ADMIN"] },
]
const send = (app: Parameters<typeof api>[0], route: Route, headers?: Record<string, string>) =>
  api(app, route.path, {
    method: route.method,
    ...(headers === undefined ? {} : { headers }),
    ...(route.body === "json" ? { json: {} } : {}),
    ...(route.body === "form" ? { form: new FormData() } : {}),
  })

describe("role matrix", () => {
  for (const route of ROUTES) {
    test(`${route.method} ${route.path}`, async ({ app, services }) => {
      const results: Record<string, boolean> = {}
      const expected: Record<string, boolean> = {}

      for (const role of ROLES) {
        const { headers } = await signInAs(services, { role })
        const res = await send(app, route, headers)

        expect(res.status).not.toBe(401)
        results[role] = res.status !== 403
        expected[role] = route.allowed.includes(role)
      }

      expect(results).toEqual(expected)
    })
  }

  test("signed-out requests are refused everywhere", async ({ app }) => {
    for (const route of ROUTES) {
      const res = await send(app, route)

      expect({ route: route.path, status: res.status }).toEqual({ route: route.path, status: 401 })
    }
  })

  test("banned users are refused everywhere, whatever their role", async ({ app, services }) => {
    for (const role of ROLES) {
      const { headers } = await signInAs(services, { role, banned: true })

      for (const route of ROUTES) {
        const res = await send(app, route, headers)

        expect({ role, route: route.path, status: res.status }).toEqual({
          role,
          route: route.path,
          status: 403,
        })
      }
    }
  })

  test("a role change applies to the very next request", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const route: Route = { method: "DELETE", path: `/groups/${id}`, allowed: ["ADMIN"] }

    expect((await send(app, route, headers)).status).toBe(404)

    await services.db.updateTable("users").set({ role: "USER" }).where("id", "=", userId).execute()

    expect((await send(app, route, headers)).status).toBe(403)
  })

  test("a ban applies to the very next request", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const route: Route = { method: "DELETE", path: `/groups/${id}`, allowed: ["ADMIN"] }

    await services.db.updateTable("users").set({ banned: true }).where("id", "=", userId).execute()

    expect((await send(app, route, headers)).status).toBe(403)
  })
})
