import { createNotificationEvents } from "@taiyomoe/cache/notification-events"
import { randomUUID } from "node:crypto"
import { describe, expect, test } from "vitest"

const waitFor = async (check: () => boolean) => {
  for (let attempt = 0; attempt < 50 && !check(); attempt++) {
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
  }

  return check()
}

describe("createNotificationEvents", () => {
  test("a stale unsubscribe leaves a newer subscription alone", async () => {
    const events = createNotificationEvents()
    const userId = randomUUID()
    let received = 0
    const unsubscribeOld = events.subscribe(userId, () => {})

    unsubscribeOld()
    events.subscribe(userId, () => {
      received += 1
    })
    unsubscribeOld()

    await new Promise((resolve) => {
      setTimeout(resolve, 300)
    })
    await events.publish([userId])

    expect(await waitFor(() => received === 1)).toBe(true)
  })
})
