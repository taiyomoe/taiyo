import { getChapterUploadProducer } from "@taiyomoe/queue"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { test } from "../setup"

describe("getChapterUploadProducer", () => {
  test("queues an upload under its task id", async () => {
    await expect(
      getChapterUploadProducer().enqueue({ taskId: randomUUID() }),
    ).resolves.toBeUndefined()
  })
})
