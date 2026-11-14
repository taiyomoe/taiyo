import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import { config } from "@taiyomoe/config"
import sharp from "sharp"
import { describe, expect } from "vitest"
import { PROFILE_IMAGE_SIZES } from "../../utils/image-crop"
import { signInAs } from "../helpers/auth"
import { tinyGif, tinyPng } from "../helpers/fixtures"
import { api } from "../helpers/request"
import { test } from "../setup"

const cropForm = (file: File, crop: Record<string, string> = {}) => {
  const form = new FormData()

  form.append("file", file)

  for (const [key, value] of Object.entries({
    x: "0",
    y: "0",
    width: "1",
    height: "1",
    rotation: "0",
    flipX: "false",
    flipY: "false",
    ...crop,
  })) {
    form.append(`crop.${key}`, value)
  }

  return form
}

describe("PATCH /users/me/profile", () => {
  test("creates or updates the profile fields", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const res = await api(app, "/users/me/profile", {
      method: "PATCH",
      headers,
      json: {
        about: { en: "Hello", fr: "Bonjour" },
        city: "Lisbon",
        country: "pt",
        birthDate: "1995-06-01",
      },
    })

    expect(res.status).toBe(200)

    await api(app, "/users/me/profile", {
      method: "PATCH",
      headers,
      json: { about: { fr: "" }, gender: "FEMALE" },
    })

    const row = await services.db
      .selectFrom("userProfiles")
      .select(["about", "city", "country", "gender"])
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow()

    expect(row).toEqual({ about: { en: "Hello" }, city: "Lisbon", country: "pt", gender: "FEMALE" })
  })

  test("rejects a birth date under the minimum age", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/profile", {
      method: "PATCH",
      headers,
      json: { birthDate: new Date().toISOString().slice(0, 10) },
    })

    expect(res.status).toBe(422)
  })
})

describe("GET /users/by-username/:username", () => {
  test("returns the profile fields and counts", async ({ app, services }) => {
    const owner = await signInAs(services)
    const viewer = await signInAs(services)
    const username = owner.userId.replace(/-/g, "").slice(0, 12)

    await api(app, "/users/me/profile", {
      method: "PATCH",
      headers: owner.headers,
      json: { city: "Osaka", country: "jp" },
    })
    await api(app, `/users/${owner.userId}/follow`, { method: "POST", headers: viewer.headers })
    await api(app, `/users/${viewer.userId}/follow`, { method: "POST", headers: owner.headers })
    await api(app, "/comments", {
      method: "POST",
      headers: viewer.headers,
      json: { targetType: "USER", targetId: owner.userId, content: "hi" },
    })

    const res = await api<Record<string, unknown>>(app, `/users/by-username/u${username}`, {
      headers: viewer.headers,
    })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toMatchObject({
      city: "Osaka",
      country: "jp",
      followerCount: 1,
      followingCount: 1,
      commentCount: 1,
      viewerFollows: true,
      followsViewer: true,
    })
  })
})

// Each frame lights a different pixel: the GIF encoder merges frames that look the same.
const animatedGif = async (frames: number) => {
  const side = 20
  const images = await Promise.all(
    Array.from({ length: frames }, (_, index) =>
      sharp(Buffer.alloc(side * side * 3).fill(255, index * 3, index * 3 + 3), {
        raw: { width: side, height: side, channels: 3 },
      })
        .png()
        .toBuffer(),
    ),
  )
  const gif = await sharp(images, { join: { animated: true } })
    .gif()
    .toBuffer()

  return new File([new Uint8Array(gif)], "frames.gif", { type: "image/gif" })
}

describe("PUT /users/me/avatar", () => {
  test("stores the cropped avatar and replaces the previous one", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const first = await api<{ image: string }>(app, "/users/me/avatar", {
      method: "PUT",
      headers,
      form: cropForm(await tinyPng(), { rotation: "12", flipX: "true" }),
    })

    expect(first.status).toBe(200)

    await api(app, "/users/me/avatar", { method: "PUT", headers, form: cropForm(await tinyPng()) })

    const listing = await services.s3.send(
      new ListObjectsV2Command({ Bucket: services.s3Bucket, Prefix: `users/${userId}/avatars/` }),
    )
    const user = await services.db
      .selectFrom("users")
      .select("image")
      .where("id", "=", userId)
      .executeTakeFirstOrThrow()

    expect(listing.Contents).toHaveLength(1)
    expect(user.image).toContain(`users/${userId}/avatars/`)
  })

  test("rejects rotating an animated GIF", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/avatar", {
      method: "PUT",
      headers,
      form: cropForm(await tinyGif(), { rotation: "10" }),
    })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("INVALID_CROP")
  })

  test("rejects a GIF with too many frames, or too many output pixels", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services)
    const upload = async (frames: number) =>
      api(app, "/users/me/avatar", {
        method: "PUT",
        headers,
        form: cropForm(await animatedGif(frames)),
      })
    const tooManyFrames = await upload(config.images.maxFrames + 1)
    const { width, height } = PROFILE_IMAGE_SIZES.avatar
    // Each frame is upscaled to the avatar's size.
    const tooManyOutputPixels = await upload(
      Math.floor(config.images.maxDecodedPixels / (width * height)) + 1,
    )

    expect(tooManyFrames.body).toMatchObject({ code: "IMAGE_TOO_COMPLEX" })
    expect(tooManyOutputPixels.body).toMatchObject({ code: "IMAGE_TOO_COMPLEX" })
  })

  test("rejects a crop outside the image", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/avatar", {
      method: "PUT",
      headers,
      form: cropForm(await tinyPng(), { x: "0.5", width: "0.8" }),
    })

    expect(res.status).toBe(422)
  })
})

describe("PUT/DELETE /users/me/banner", () => {
  test("stores then removes the banner", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const put = await api<{ bannerUrl: string }>(app, "/users/me/banner", {
      method: "PUT",
      headers,
      form: cropForm(await tinyPng()),
    })

    expect(put.status).toBe(200)

    const removed = await api(app, "/users/me/banner", { method: "DELETE", headers })

    expect(removed.status).toBe(200)

    const row = await services.db
      .selectFrom("userProfiles")
      .select("banner")
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow()

    expect(row.banner).toBeNull()
  })
})
