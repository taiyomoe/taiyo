import { reapOrphanCommentImages } from "@taiyomoe/queue"
import sharp from "sharp"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { invalidImage } from "../helpers/fixtures"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"
import {
  animatedGif,
  type CommentImage,
  expectSuccess,
  listComments,
  patternedImage,
  postComment,
  uploadImage,
} from "./helpers"

describe("uploading", () => {
  test("re-encodes images as WebP, keeps animations and deduplicates", async ({
    app,
    services,
  }) => {
    const user = await signInAs(services)
    const still = expectSuccess(await uploadImage(app, user.headers, await patternedImage(1)))
    const again = expectSuccess(await uploadImage(app, user.headers, await patternedImage(1)))
    const gif = expectSuccess(await uploadImage(app, user.headers, await animatedGif()))

    expect(still).toMatchObject({ width: 64, height: 64, animated: false })
    expect(still.url).toMatch(/\/comment-images\/[0-9a-f-]+\.webp$/)
    expect(again.id).toBe(still.id)
    expect(gif).toMatchObject({ animated: true, width: 64, height: 64 })

    const stored = await services.db
      .selectFrom("commentImages")
      .select(["key", "byteSize"])
      .where("id", "=", gif.id)
      .executeTakeFirstOrThrow()
    const object = await services.s3.send(
      new (await import("@taiyomoe/s3")).GetObjectCommand({
        Bucket: services.s3Bucket,
        Key: stored.key,
      }),
    )
    const body = Buffer.from(await (object.Body?.transformToByteArray() ?? new Uint8Array()))
    const metadata = await sharp(body, { animated: true }).metadata()

    expect(metadata).toMatchObject({ format: "webp", pages: 3 })
    expect(metadata.exif).toBeUndefined()
  })

  test("rejects files that aren't images or are too large", async ({ app, services }) => {
    const user = await signInAs(services)
    const fake = await uploadImage(app, user.headers, invalidImage())
    const disguised = await uploadImage(
      app,
      user.headers,
      new File([new TextEncoder().encode("<svg onload=alert(1)>")], "x.png", {
        type: "image/png",
      }),
    )
    const huge = await sharp({
      create: { width: 5000, height: 10, channels: 3, background: "#000" },
    })
      .png()
      .toBuffer()
    const tooWide = await uploadImage(
      app,
      user.headers,
      new File([new Uint8Array(huge)], "wide.png", { type: "image/png" }),
    )

    expect([fake.status, disguised.status]).toEqual([422, 422])
    expect(tooWide.body).toMatchObject({ code: "COMMENT_IMAGE_TOO_COMPLEX" })
  })
})

describe("using images in comments", () => {
  test("allows your own uploads and favorites, not other people's images", async ({
    app,
    services,
  }) => {
    const alice = await signInAs(services)
    const bob = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, alice.userId) }
    const image = expectSuccess(await uploadImage(app, alice.headers, await patternedImage(2)))
    const content = `look\n![](image:${image.id})\nnice`
    const posted = await postComment(app, alice.headers, target, content)

    expect(posted.images).toMatchObject([{ id: image.id, url: image.url, favorited: false }])

    const stolen = await api(app, "/comments", {
      method: "POST",
      headers: bob.headers,
      json: { targetType: target.type, targetId: target.id, content },
    })

    expect(stolen.body).toMatchObject({ code: "COMMENT_IMAGE_UNAVAILABLE" })

    const favorite = await api(app, `/comment-images/${image.id}/favorite`, {
      method: "PUT",
      headers: bob.headers,
    })

    expect(favorite.status).toBe(200)

    const reused = await postComment(app, bob.headers, target, content)

    expect(reused.images).toMatchObject([{ id: image.id, favorited: true }])

    const favorites = expectSuccess(
      await api<Array<{ id: string }>>(app, "/comment-images/me?collection=favorites", {
        headers: bob.headers,
      }),
    )

    expect(favorites.map((item) => item.id)).toEqual([image.id])
  })

  test("lists only posted images under my uploads", async ({ app, services }) => {
    const user = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, user.userId) }
    const posted = expectSuccess(await uploadImage(app, user.headers, await patternedImage(3)))

    expectSuccess(await uploadImage(app, user.headers, await patternedImage(4)))
    await postComment(app, user.headers, target, `![](image:${posted.id})`)

    const uploads = expectSuccess(
      await api<CommentImage[]>(app, "/comment-images/me?collection=uploads", {
        headers: user.headers,
      }),
    )

    expect(uploads.map((item) => item.id)).toEqual([posted.id])
  })
})

describe("removing images", () => {
  test("removes an image everywhere and blocks it and its lookalikes", async ({
    app,
    services,
  }) => {
    const author = await signInAs(services)
    const fan = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const image = expectSuccess(await uploadImage(app, author.headers, await patternedImage(5)))

    await postComment(app, author.headers, target, `![](image:${image.id})`)
    await api(app, `/comment-images/${image.id}/favorite`, { method: "PUT", headers: fan.headers })

    const denied = await api(app, `/comment-images/${image.id}`, {
      method: "DELETE",
      headers: author.headers,
    })

    expect(denied.status).toBe(403)

    const removed = expectSuccess(
      await api<{ comments: number }>(app, `/comment-images/${image.id}`, {
        method: "DELETE",
        headers: moderator.headers,
      }),
    )

    expect(removed.comments).toBe(1)

    const { data } = await listComments(app, target)

    expect(data[0]?.images).toMatchObject([{ id: image.id, url: null }])

    const favorites = expectSuccess(
      await api<unknown[]>(app, "/comment-images/me?collection=favorites", {
        headers: fan.headers,
      }),
    )

    expect(favorites).toEqual([])

    const sameFile = await uploadImage(app, fan.headers, await patternedImage(5))
    const reencoded = await uploadImage(app, fan.headers, await patternedImage(5, "jpeg"))
    const unrelated = await uploadImage(app, fan.headers, await patternedImage(9))
    const comment = data[0]
    const edited = await api<{ images: Array<{ id: string; url: string | null }> }>(
      app,
      `/comments/${comment?.id ?? ""}`,
      {
        method: "PATCH",
        headers: author.headers,
        json: { content: `![](image:${image.id})\nstill here` },
      },
    )

    expect(expectSuccess(edited).images).toMatchObject([{ id: image.id, url: null }])

    const reused = await api(app, "/comments", {
      method: "POST",
      headers: author.headers,
      json: { targetType: target.type, targetId: target.id, content: `![](image:${image.id})` },
    })

    expect(reused.body).toMatchObject({ code: "COMMENT_IMAGE_UNAVAILABLE" })
    expect(sameFile.body).toMatchObject({ code: "COMMENT_IMAGE_BLOCKED" })
    expect(reencoded.body).toMatchObject({ code: "COMMENT_IMAGE_BLOCKED" })
    expect(unrelated.status).toBe(201)

    const stretched = await sharp(Buffer.from(await (await patternedImage(5)).arrayBuffer()))
      .resize(128, 64, { fit: "fill" })
      .png()
      .toBuffer()
    const otherShape = await uploadImage(
      app,
      fan.headers,
      new File([new Uint8Array(stretched)], "wide.png", { type: "image/png" }),
    )

    expect(otherShape.status).toBe(201)
  })
})

describe("reaping", () => {
  test("deletes images nobody posted or favorited after a day", async ({ app, services }) => {
    const user = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, user.userId) }
    const orphan = expectSuccess(await uploadImage(app, user.headers, await patternedImage(6)))
    const used = expectSuccess(await uploadImage(app, user.headers, await patternedImage(7)))
    const favorite = expectSuccess(await uploadImage(app, user.headers, await patternedImage(8)))

    await postComment(app, user.headers, target, `![](image:${used.id})`)
    await api(app, `/comment-images/${favorite.id}/favorite`, {
      method: "PUT",
      headers: user.headers,
    })

    const reaped = await reapOrphanCommentImages(services, new Date(Date.now() + 25 * 3600_000))

    expect(reaped.map((image) => image.id)).toEqual([orphan.id])

    const remaining = await services.db.selectFrom("commentImages").select("id").execute()

    expect(remaining.map((row) => row.id).sort()).toEqual([used.id, favorite.id].sort())
  })
})
