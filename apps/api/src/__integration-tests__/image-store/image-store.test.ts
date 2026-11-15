import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { putImage } from "../../image-store"
import { tinyGif, tinyPng } from "../helpers/fixtures"
import { test } from "../setup"

const createDeps = (services: Services) => {
  const afterCommit: Array<() => Promise<void>> = []
  const onRollback: Array<() => Promise<void>> = []

  return {
    deps: {
      s3: services.s3,
      s3Bucket: services.s3Bucket,
      afterCommit: (cb: () => Promise<void>) => {
        afterCommit.push(cb)
      },
      onRollback: (cb: () => Promise<void>) => {
        onRollback.push(cb)
      },
    },
    commit: () => Promise.all(afterCommit.map((cb) => cb())),
    rollback: () => Promise.all(onRollback.map((cb) => cb())),
  }
}
const listKeys = async ({ s3, s3Bucket }: Services, prefix: string) => {
  const listed = await s3.send(new ListObjectsV2Command({ Bucket: s3Bucket, Prefix: prefix }))

  return (listed.Contents ?? []).map((object) => object.Key)
}

describe("putImage", () => {
  test("stores a still image as a jpg under the cover key", async ({ services }) => {
    const { deps } = createDeps(services)
    const mediaId = randomUUID()
    const id = randomUUID()
    const image = await putImage(deps, { kind: "cover", mediaId, id }, await tinyPng())

    expect(image).toEqual({ key: `medias/${mediaId}/covers/${id}.jpg`, extension: "jpg" })
    expect(await listKeys(services, `medias/${mediaId}/`)).toEqual([image.key])
  })

  test("keeps a gif a gif under the banner key", async ({ services }) => {
    const { deps } = createDeps(services)
    const mediaId = randomUUID()
    const id = randomUUID()
    const image = await putImage(deps, { kind: "banner", mediaId, id }, await tinyGif())

    expect(image).toEqual({ key: `medias/${mediaId}/banners/${id}.gif`, extension: "gif" })
  })

  test("deletes what it uploaded when the transaction rolls back", async ({ services }) => {
    const { deps, rollback } = createDeps(services)
    const mediaId = randomUUID()

    await putImage(deps, { kind: "cover", mediaId, id: randomUUID() }, await tinyPng())
    await putImage(deps, { kind: "cover", mediaId, id: randomUUID() }, await tinyPng())
    await rollback()

    expect(await listKeys(services, `medias/${mediaId}/`)).toEqual([])
  })

  test("a replacement deletes the old image after commit", async ({ services }) => {
    const staffId = randomUUID()
    const first = createDeps(services)
    const old = await putImage(first.deps, { kind: "staff", staffId }, await tinyPng())
    const second = createDeps(services)
    const next = await putImage(second.deps, { kind: "staff", staffId }, await tinyPng(), {
      replaces: old.key,
    })

    expect(next.key).not.toBe(old.key)

    await second.commit()

    expect(await listKeys(services, `staffs/${staffId}/`)).toEqual([next.key])
  })

  test("a rolled-back replacement leaves the current image in place", async ({ services }) => {
    const staffId = randomUUID()
    const first = createDeps(services)
    const old = await putImage(first.deps, { kind: "staff", staffId }, await tinyPng())
    const second = createDeps(services)

    await putImage(second.deps, { kind: "staff", staffId }, await tinyPng(), {
      replaces: old.key,
    })
    await second.rollback()

    expect(await listKeys(services, `staffs/${staffId}/`)).toEqual([old.key])
  })
})
