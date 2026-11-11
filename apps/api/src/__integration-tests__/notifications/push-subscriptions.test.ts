import { config } from "@taiyomoe/config"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { answerPushWith, getSentPushes } from "../helpers/push-sender"
import { api } from "../helpers/request"
import { test } from "../setup"

const KEYS = {
  p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u",
  auth: "tBHItJI5svbpez7KI4CCXg",
}
const endpointFor = (name: string) => `https://push.example/send/${name}`
const subscribe = (
  app: Parameters<typeof api>[0],
  headers: Record<string, string>,
  endpoint: string,
) =>
  api(app, "/users/me/push-subscriptions", {
    method: "PUT",
    headers,
    json: { endpoint, keys: KEYS },
  })
const subscriptionsOf = async ({ db }: Services, userId: string) => {
  const rows = await db
    .selectFrom("pushSubscriptions")
    .select("endpoint")
    .where("userId", "=", userId)
    .orderBy("endpoint")
    .execute()

  return rows.map((row) => row.endpoint)
}

describe("push subscriptions", () => {
  test("returns the VAPID public key", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/push-subscriptions/public-key", { headers })

    expect(res.body).toMatchObject({ data: { publicKey: "test-vapid-public-key" } })
  })

  test("subscribing a device moves it to the account that saves it", async ({ app, services }) => {
    const first = await signInAs(services)
    const second = await signInAs(services)
    const endpoint = endpointFor("shared-laptop")

    expect((await subscribe(app, first.headers, endpoint)).status).toBe(200)
    expect(await subscriptionsOf(services, first.userId)).toEqual([endpoint])

    await subscribe(app, second.headers, endpoint)

    expect(await subscriptionsOf(services, first.userId)).toEqual([])
    expect(await subscriptionsOf(services, second.userId)).toEqual([endpoint])
  })

  test("keeps only the most recently saved devices", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const { maxPushSubscriptions } = config.notifications

    for (let i = 0; i <= maxPushSubscriptions; i++) {
      await subscribe(app, headers, endpointFor(`device-${String(i).padStart(2, "0")}`))
    }

    const kept = await subscriptionsOf(services, userId)

    expect(kept).toHaveLength(maxPushSubscriptions)
    expect(kept).not.toContain(endpointFor("device-00"))
  })

  test("rejects an endpoint that is not https", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    expect((await subscribe(app, headers, "http://push.example/send/plain")).status).toBe(422)
  })

  test("unsubscribing only forgets your own device", async ({ app, services }) => {
    const owner = await signInAs(services)
    const stranger = await signInAs(services)
    const endpoint = endpointFor("phone")

    await subscribe(app, owner.headers, endpoint)
    await api(app, "/users/me/push-subscriptions", {
      method: "DELETE",
      headers: stranger.headers,
      json: { endpoint },
    })

    expect(await subscriptionsOf(services, owner.userId)).toEqual([endpoint])

    await api(app, "/users/me/push-subscriptions", {
      method: "DELETE",
      headers: owner.headers,
      json: { endpoint },
    })

    expect(await subscriptionsOf(services, owner.userId)).toEqual([])
  })

  test("sends a test push to a subscribed device", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const endpoint = endpointFor("tablet")

    await subscribe(app, headers, endpoint)

    const res = await api(app, "/users/me/push-subscriptions/test", {
      method: "POST",
      headers,
      json: { endpoint },
    })

    expect(res.status).toBe(201)
    expect(getSentPushes(services.pushSender)).toMatchObject([
      { endpoint, message: { url: "/notifications" } },
    ])
  })

  test("forgets a device the push service dropped", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const endpoint = endpointFor("old-phone")

    await subscribe(app, headers, endpoint)
    answerPushWith(services.pushSender, endpoint, 410)

    const res = await api(app, "/users/me/push-subscriptions/test", {
      method: "POST",
      headers,
      json: { endpoint },
    })

    expect(res.status).toBe(410)
    expect(res.body).toMatchObject({ code: "PUSH_SUBSCRIPTION_EXPIRED" })
    expect(await subscriptionsOf(services, userId)).toEqual([])
  })

  test("refuses a test push to a device you did not subscribe", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/push-subscriptions/test", {
      method: "POST",
      headers,
      json: { endpoint: endpointFor("unknown") },
    })

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ code: "PUSH_SUBSCRIPTION_NOT_FOUND" })
  })
})
