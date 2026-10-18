import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup } from "../helpers/seed"
import { test } from "../setup"

describe("GET /ownership-requests", () => {
  test("admins see pending claims across groups with the proof", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const requester = await signInAs(services)
    const groupId = await seedGroup(services, admin.userId, `G ${randomUUID()}`)

    await api(app, `/groups/${groupId}/ownership-requests`, {
      method: "POST",
      headers: requester.headers,
      json: { message: "It's mine.", proofLinks: ["https://example.com/proof"] },
    })

    const res = await api<
      Array<{
        group: { id: string; owned: boolean }
        requester: { id: string }
        message: string
        proofLinks: string[]
      }>
    >(app, "/ownership-requests", { headers: admin.headers })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.find((item) => item.group.id === groupId)).toMatchObject({
      group: { id: groupId, owned: false },
      requester: { id: requester.userId },
      message: "It's mine.",
      proofLinks: ["https://example.com/proof"],
    })
  })

  test("everyone but admins is refused", async ({ app, services }) => {
    for (const role of ["USER", "UPLOADER_INTERN", "UPLOADER", "MODERATOR"] as const) {
      const { headers } = await signInAs(services, { role })
      const res = await api(app, "/ownership-requests", { headers })

      expect(res.status).toBe(403)
    }
  })
})
