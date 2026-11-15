import { getDb } from "@taiyomoe/db"
import { getS3Bucket, getS3Client } from "@taiyomoe/s3"
import { type ImageTarget, putImage } from "../image-store"

// The old site kept a profile banner as a bare file name under users/banners/, and a group's
// logo and banner as a link to wherever it was hosted (imgur, Discord), or as an empty
// string. This copies each image into the bucket, through the same checks and encoding as an
// upload, under the keys the api reads; an image that cannot be fetched or decoded is
// cleared. Once, after the import:
//   pnpm -F @taiyomoe/api backfill:legacy-images
//
// It can run again: rows that already hold a key are left alone.
const LEGACY_CDN_URL = "https://cdn.taiyo.moe"
const MAX_DOWNLOAD_BYTES = 10_000_000
const DOWNLOAD_TIMEOUT_MS = 15_000
const log = (message: string) => process.stdout.write(`${message}\n`)
const db = getDb()
const deps = {
  s3: getS3Client(),
  s3Bucket: getS3Bucket(),
  afterCommit: () => undefined,
  onRollback: () => undefined,
}
const download = async (url: string) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) }).catch(
    () => null,
  )

  if (response === null || !response.ok) {
    return null
  }

  if (!(response.headers.get("content-type") ?? "").startsWith("image/")) {
    return null
  }

  const body = await response.arrayBuffer()

  return body.byteLength > MAX_DOWNLOAD_BYTES ? null : new File([body], "image")
}
const importImage = async (url: string, target: ImageTarget) => {
  const file = await download(url)

  if (file === null) {
    log(`  unreachable or not an image: ${url}`)

    return null
  }

  return putImage(deps, target, file).then(
    ({ key }) => key,
    (error: unknown) => {
      log(`  could not store ${url}: ${error instanceof Error ? error.message : String(error)}`)

      return null
    },
  )
}
const emptyLogos = await db
  .updateTable("groups")
  .set({ logo: null })
  .where("logo", "=", "")
  .executeTakeFirst()
const emptyBanners = await db
  .updateTable("groups")
  .set({ banner: null })
  .where("banner", "=", "")
  .executeTakeFirst()

log(
  `Cleared ${emptyLogos.numUpdatedRows} empty group logos and ${emptyBanners.numUpdatedRows} empty group banners`,
)

const profiles = await db
  .selectFrom("userProfiles")
  .select(["userId", "banner"])
  .where("banner", "is not", null)
  .where("banner", "not like", "%/%")
  .execute()
let imported = 0
let cleared = 0

for (const { userId, banner } of profiles) {
  const key = await importImage(`${LEGACY_CDN_URL}/users/banners/${banner}`, {
    kind: "profileBanner",
    userId,
  })

  await db.updateTable("userProfiles").set({ banner: key }).where("userId", "=", userId).execute()

  if (key === null) {
    cleared++
  } else {
    imported++
  }
}

const groups = await db
  .selectFrom("groups")
  .select(["id", "logo", "banner"])
  .where((eb) => eb.or([eb("logo", "~", "^https?://"), eb("banner", "~", "^https?://")]))
  .execute()

for (const group of groups) {
  for (const field of ["logo", "banner"] as const) {
    const url = group[field]

    if (url === null || !/^https?:\/\//.test(url)) {
      continue
    }

    const key = await importImage(url, {
      kind: field === "logo" ? "groupLogo" : "groupBanner",
      groupId: group.id,
    })

    await db
      .updateTable("groups")
      .set(field === "logo" ? { logo: key } : { banner: key })
      .where("id", "=", group.id)
      .execute()

    if (key === null) {
      cleared++
    } else {
      imported++
    }
  }
}

log(`Done: ${imported} images copied into the bucket, ${cleared} cleared`)
process.exit(0)
