import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup } from "../helpers/seed"
import { test } from "../setup"

const request = (name = `New ${randomUUID()}`) => ({
  name,
  description: "We translate seinen.",
  message: "I lead this new group.",
  proofLinks: ["https://discord.gg/example"],
})
const create = (
  app: Parameters<typeof api>[0],
  headers: Record<string, string>,
  body: Record<string, unknown> = request(),
) => api<{ id: string }>(app, "/group-creation-requests", { method: "POST", headers, json: body })
const idOf = (res: Awaited<ReturnType<typeof create>>) => {
  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data.id
}

describe("group creation requests", () => {
  test("approving creates the group with the requester as its only owner", async ({
    app,
    services,
  }) => {
    const requester = await signInAs(services)
    const admin = await signInAs(services, { role: "ADMIN" })
    const body = request()
    const id = idOf(await create(app, requester.headers, body))
    const res = await api<{ groupId: string }>(app, `/group-creation-requests/${id}/approve`, {
      method: "POST",
      headers: admin.headers,
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const { groupId } = res.body.data
    const group = await services.db
      .selectFrom("groups")
      .select(["name", "description"])
      .where("id", "=", groupId)
      .executeTakeFirstOrThrow()
    const members = await services.db
      .selectFrom("groupMemberships")
      .select(["userId", "role"])
      .where("groupId", "=", groupId)
      .execute()
    const stored = await services.db
      .selectFrom("groupCreationRequests")
      .select(["status", "groupId", "reviewerId"])
      .where("id", "=", id)
      .executeTakeFirstOrThrow()

    expect(group).toEqual({ name: body.name, description: body.description })
    expect(members).toEqual([{ userId: requester.userId, role: "OWNER" }])
    expect(stored).toEqual({ status: "APPROVED", groupId, reviewerId: admin.userId })
  })

  test("only admins can list, approve and reject", async ({ app, services }) => {
    const requester = await signInAs(services)
    const id = idOf(await create(app, requester.headers))

    for (const role of ["USER", "UPLOADER_INTERN", "UPLOADER", "MODERATOR"] as const) {
      const { headers } = await signInAs(services, { role })
      const list = await api(app, "/group-creation-requests", { headers })
      const approve = await api(app, `/group-creation-requests/${id}/approve`, {
        method: "POST",
        headers,
      })
      const reject = await api(app, `/group-creation-requests/${id}/reject`, {
        method: "POST",
        headers,
        json: { note: "No." },
      })

      expect([list.status, approve.status, reject.status]).toEqual([403, 403, 403])
    }

    const groups = await services.db
      .selectFrom("groupCreationRequests")
      .select("status")
      .where("id", "=", id)
      .executeTakeFirstOrThrow()

    expect(groups.status).toBe("PENDING")
  })

  test("names of existing groups are refused so they get claimed instead", async ({
    app,
    services,
  }) => {
    const requester = await signInAs(services)
    const name = `Taken ${randomUUID()}`

    await seedGroup(services, requester.userId, name)

    const res = await create(app, requester.headers, request(name.toUpperCase()))

    expect(res.body).toMatchObject({ code: "GROUP_NAME_TAKEN" })
  })

  test("approval is refused if the name was taken in the meantime", async ({ app, services }) => {
    const requester = await signInAs(services)
    const admin = await signInAs(services, { role: "ADMIN" })
    const name = `Race ${randomUUID()}`
    const id = idOf(await create(app, requester.headers, request(name)))

    await seedGroup(services, admin.userId, name)

    const res = await api(app, `/group-creation-requests/${id}/approve`, {
      method: "POST",
      headers: admin.headers,
    })

    expect(res.body).toMatchObject({ code: "GROUP_NAME_TAKEN" })
  })

  test("a user can have three pending requests and no duplicates", async ({ app, services }) => {
    const requester = await signInAs(services)
    const name = `Mine ${randomUUID()}`

    expect((await create(app, requester.headers, request(name))).status).toBe(201)
    expect((await create(app, requester.headers, request(name))).body).toMatchObject({
      code: "GROUP_CREATION_REQUEST_EXISTS",
    })
    expect((await create(app, requester.headers)).status).toBe(201)
    expect((await create(app, requester.headers)).status).toBe(201)
    expect((await create(app, requester.headers)).body).toMatchObject({
      code: "GROUP_CREATION_REQUEST_LIMIT",
    })
  })

  test("requires a message and http proof links", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    for (const body of [
      { ...request(), message: "" },
      { ...request(), proofLinks: [] },
      { ...request(), proofLinks: [["javascript", "alert(1)"].join(":")] },
      { ...request(), name: "  " },
    ]) {
      expect((await create(app, headers, body)).status).toBe(422)
    }
  })

  test("rejecting needs a note and closes the request", async ({ app, services }) => {
    const requester = await signInAs(services)
    const admin = await signInAs(services, { role: "ADMIN" })
    const id = idOf(await create(app, requester.headers))
    const empty = await api(app, `/group-creation-requests/${id}/reject`, {
      method: "POST",
      headers: admin.headers,
      json: {},
    })
    const rejected = await api(app, `/group-creation-requests/${id}/reject`, {
      method: "POST",
      headers: admin.headers,
      json: { note: "Already exists under another name." },
    })
    const approve = await api(app, `/group-creation-requests/${id}/approve`, {
      method: "POST",
      headers: admin.headers,
    })

    expect(empty.status).toBe(422)
    expect(rejected.status).toBe(201)
    expect(approve.body).toMatchObject({ code: "GROUP_CREATION_REQUEST_NOT_PENDING" })
  })

  test("only the requester can cancel", async ({ app, services }) => {
    const requester = await signInAs(services)
    const other = await signInAs(services)
    const id = idOf(await create(app, requester.headers))
    const foreign = await api(app, `/group-creation-requests/${id}`, {
      method: "DELETE",
      headers: other.headers,
    })
    const own = await api(app, `/group-creation-requests/${id}`, {
      method: "DELETE",
      headers: requester.headers,
    })

    expect(foreign.status).toBe(404)
    expect(own.status).toBe(200)
  })

  test("two approvals at the same time create one group", async ({ app, services }) => {
    const requester = await signInAs(services)
    const admin = await signInAs(services, { role: "ADMIN" })
    const body = request()
    const id = idOf(await create(app, requester.headers, body))
    const results = await Promise.all(
      [1, 2].map(() =>
        api(app, `/group-creation-requests/${id}/approve`, {
          method: "POST",
          headers: admin.headers,
        }),
      ),
    )
    const groups = await services.db
      .selectFrom("groups")
      .select("id")
      .where("name", "=", body.name)
      .execute()

    expect(results.map((res) => res.status).sort((a, b) => a - b)).toEqual([201, 409])
    expect(groups).toHaveLength(1)
  })

  test("admins list pending requests oldest first, requesters list their own", async ({
    app,
    services,
  }) => {
    const requester = await signInAs(services)
    const admin = await signInAs(services, { role: "ADMIN" })
    const first = idOf(await create(app, requester.headers))
    const second = idOf(await create(app, requester.headers))

    await services.db
      .updateTable("groupCreationRequests")
      .set({ createdAt: new Date("2026-01-01T00:00:00Z") })
      .where("id", "=", first)
      .execute()

    const all = await api<Array<{ id: string; requester: { id: string } }>>(
      app,
      "/group-creation-requests",
      { headers: admin.headers },
    )
    const mine = await api<Array<{ id: string }>>(app, "/users/me/group-creation-requests", {
      headers: requester.headers,
    })

    if (!all.body.success || !mine.body.success) {
      throw new Error("Expected success")
    }

    expect(all.body.data.map((item) => item.id)).toEqual([first, second])
    expect(all.body.data[0]?.requester.id).toBe(requester.userId)
    expect(mine.body.data.map((item) => item.id)).toEqual([second, first])
  })
})
