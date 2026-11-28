import type { DB, Json } from "@taiyomoe/db"
import { Upload } from "@aws-sdk/lib-storage"
import { config } from "@taiyomoe/config"
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  getDataExportKey,
  getOwnedAvatarKey,
  type S3Client,
} from "@taiyomoe/s3"
import { Zip, ZipDeflate, ZipPassThrough } from "fflate"
import { type Kysely, sql } from "kysely"
import { once } from "node:events"
import { PassThrough, Readable } from "node:stream"
import { EXPORT_LIST_FILES } from "./domains"
import {
  type ExportImages,
  serializeAccount,
  serializeCommentImage,
  serializeProfile,
  serializeSettings,
} from "./serializers"

export type DataExportDeps = {
  db: Kysely<DB>
  s3: S3Client
  s3Bucket: string
  s3PrivateBucket: string
}

type ZipFile = ZipDeflate | ZipPassThrough

const encoder = new TextEncoder()
const toJson = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const extensionOf = (key: string) => /\.([a-z0-9]+)$/i.exec(key)?.[1] ?? "jpg"
const isMissingObject = (err: unknown) =>
  err instanceof Error && (err.name === "NoSuchKey" || err.name === "NotFound")
/**
 * A ZIP written straight into an upload. Every chunk waits for the upload to take the previous
 * ones, so memory holds a few upload parts whatever the size of the archive.
 */
const createArchive = (out: PassThrough) => {
  let failure: Error | null = null
  let byteSize = 0
  const zip = new Zip((err, chunk, final) => {
    if (err !== null) {
      failure = err
      out.destroy(err)

      return
    }

    byteSize += chunk.byteLength
    out.write(chunk)

    if (final) {
      out.end()
    }
  })
  const drained = async () => {
    if (failure !== null) {
      throw failure
    }

    if (out.destroyed) {
      throw new Error("the archive upload stopped")
    }

    if (out.writableNeedDrain) {
      await once(out, "drain")
    }
  }
  const open = (name: string, compress: boolean) => {
    const file: ZipFile = compress ? new ZipDeflate(name, { level: 6 }) : new ZipPassThrough(name)

    zip.add(file)

    return file
  }
  const push = async (file: ZipFile, data: Uint8Array | string, final = false) => {
    file.push(typeof data === "string" ? encoder.encode(data) : data, final)
    await drained()
  }

  return {
    addText: (name: string, text: string) => push(open(name, true), text, true),
    addJsonList: async (name: string, rows: AsyncIterable<unknown>) => {
      const file = open(name, true)
      let count = 0

      await push(file, "[")

      for await (const row of rows) {
        const item = JSON.stringify(row, null, 2).replaceAll("\n", "\n  ")

        await push(file, `${count === 0 ? "\n" : ",\n"}  ${item}`)
        count += 1
      }

      await push(file, count === 0 ? "]\n" : "\n]\n", true)
    },
    addStream: async (name: string, body: Readable) => {
      const file = open(name, false)

      for await (const chunk of body) {
        await push(file, chunk instanceof Uint8Array ? chunk : encoder.encode(String(chunk)))
      }

      await push(file, new Uint8Array(0), true)
    },
    end: async () => {
      zip.end()
      await drained()
    },
    getByteSize: () => byteSize,
  }
}

type Archive = ReturnType<typeof createArchive>

const getReadme = (generatedAt: Date) =>
  [
    "Your Taiyō data",
    "===============",
    "",
    `This archive holds the data Taiyō kept about your account on ${generatedAt.toISOString()} (UTC).`,
    "Each .json file is UTF-8 JSON, dates are ISO 8601 in UTC, and IDs are the ones the site uses in its links.",
    "",
    "Files",
    "-----",
    "",
    "account.json: your account: username, display name, email, role, ban status, how you sign in (by method only, never its secrets) and the changes to your names.",
    "profile.json: your profile, the cosmetics you wear and your point balance.",
    "settings.json: your site and reader settings.",
    ...EXPORT_LIST_FILES.map(({ name, description }) => `${name}: ${description}`),
    "comment-images.json: the images you attached to comments; the files are in images/comments/.",
    "images/: your avatar, your profile banner and your comment images, when Taiyō stores them.",
    "",
    "Left out on purpose",
    "-------------------",
    "",
    "Your password and two-factor secrets (kept only as hashes or encrypted), sign-in tokens and push keys: they are credentials, not information about you, and an archive that leaks would hand over your account.",
    "Reports other people filed about you and the moderation team's notes: they belong to the people who wrote them.",
    "Other people's private content, such as the names of private lists you upvoted.",
    "The pages of the chapters you uploaded: they are published content. uploaded-chapters.json lists the chapters.",
    "",
  ].join("\n")
const writeAccount = async (archive: Archive, db: Kysely<DB>, userId: string) => {
  const [user, providers, nameChanges] = await Promise.all([
    db
      .selectFrom("users")
      .select([
        "id",
        "username",
        "displayUsername",
        "email",
        "emailVerified",
        "role",
        "twoFactorEnabled",
        "banned",
        "banReason",
        "banExpires",
        "createdAt",
      ])
      .where("id", "=", userId)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("accounts")
      .select(["providerId", "createdAt"])
      .where("userId", "=", userId)
      .orderBy("createdAt")
      .execute(),
    db
      .selectFrom("auditLogs")
      .select([
        "createdAt as changedAt",
        sql<Json>`"event" -> 'audit' -> 'changes' -> 'before'`.as("before"),
        sql<Json>`"event" -> 'audit' -> 'changes' -> 'after'`.as("after"),
      ])
      .where("targetType", "=", "user")
      .where("targetId", "=", userId)
      .where("outcome", "=", "success")
      .where(
        sql<boolean>`("event" -> 'audit' -> 'changes' -> 'after') ?| array['username', 'displayUsername']`,
      )
      .orderBy("createdAt")
      .execute(),
  ])

  await archive.addText("account.json", toJson(serializeAccount(user, providers, nameChanges)))
}
const writeImage = async (
  archive: Archive,
  { s3, s3Bucket }: DataExportDeps,
  key: string,
  name: string,
) => {
  try {
    const { Body } = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: key }))

    if (!(Body instanceof Readable)) {
      return null
    }

    await archive.addStream(name, Body)

    return name
  } catch (err) {
    if (isMissingObject(err)) {
      return null
    }

    throw err
  }
}
const writeProfile = async (
  archive: Archive,
  deps: DataExportDeps,
  db: Kysely<DB>,
  userId: string,
) => {
  const user = await db
    .selectFrom("users")
    .leftJoin("userProfiles as p", "p.userId", "users.id")
    .select([
      "users.image",
      "users.nameEffect",
      "users.avatarBorder",
      "users.settings",
      "users.readerSettings",
      "users.updatedAt",
      "p.about",
      "p.city",
      "p.country",
      "p.gender",
      "p.birthDate",
      "p.title",
      "p.points",
      "p.banner",
    ])
    .where("users.id", "=", userId)
    .executeTakeFirstOrThrow()
  const avatarKey = getOwnedAvatarKey(userId, user.image)
  const images: ExportImages = {
    avatar:
      avatarKey === null
        ? null
        : await writeImage(archive, deps, avatarKey, `images/avatar.${extensionOf(avatarKey)}`),
    banner:
      user.banner === null
        ? null
        : await writeImage(archive, deps, user.banner, `images/banner.${extensionOf(user.banner)}`),
  }

  await archive.addText(
    "profile.json",
    toJson(
      serializeProfile(
        {
          about: user.about ?? {},
          city: user.city,
          country: user.country,
          gender: user.gender ?? "UNKNOWN",
          birthDate: user.birthDate,
          title: user.title,
          points: user.points ?? 0,
          nameEffect: user.nameEffect,
          avatarBorder: user.avatarBorder,
          externalAvatarUrl: avatarKey === null ? user.image : null,
          updatedAt: user.updatedAt,
        },
        images,
      ),
    ),
  )
  await archive.addText("settings.json", toJson(serializeSettings(user)))
}
const listCommentImages = (db: Kysely<DB>, userId: string, offset: number) =>
  db
    .selectFrom("commentImages")
    .select(["id", "key", "width", "height", "animated", "byteSize", "createdAt", "removedAt"])
    .where("uploaderId", "=", userId)
    .orderBy("createdAt")
    .orderBy("id")
    .limit(config.dataExports.pageSize)
    .offset(offset)
    .execute()
const writeCommentImages = async (
  archive: Archive,
  deps: DataExportDeps,
  db: Kysely<DB>,
  userId: string,
) => {
  const written = new Map<string, string>()
  const { pageSize } = config.dataExports

  for (let offset = 0; ; offset += pageSize) {
    const batch = await listCommentImages(db, userId, offset)

    for (const image of batch) {
      if (image.removedAt === null) {
        const name = `images/comments/${image.id}.${extensionOf(image.key)}`
        const file = await writeImage(archive, deps, image.key, name)

        if (file !== null) {
          written.set(image.id, file)
        }
      }
    }

    if (batch.length < pageSize) {
      break
    }
  }

  await archive.addJsonList(
    "comment-images.json",
    (async function* rows() {
      for (let offset = 0; ; offset += pageSize) {
        const batch = await listCommentImages(db, userId, offset)

        for (const image of batch) {
          yield serializeCommentImage(image, written.get(image.id) ?? null)
        }

        if (batch.length < pageSize) {
          return
        }
      }
    })(),
  )
}
/** Writes the archive of everything Taiyō holds about the user, as one consistent snapshot. */
const writeArchive = async (archive: Archive, deps: DataExportDeps, userId: string) => {
  await deps.db
    .transaction()
    .setIsolationLevel("repeatable read")
    .setAccessMode("read only")
    .execute(async (trx) => {
      await archive.addText("README.txt", getReadme(new Date()))
      await writeAccount(archive, trx, userId)
      await writeProfile(archive, deps, trx, userId)

      for (const { name, rows } of EXPORT_LIST_FILES) {
        await archive.addJsonList(name, rows(trx, userId))
      }

      await writeCommentImages(archive, deps, trx, userId)
    })
  await archive.end()
}
const deleteArchive = ({ s3, s3PrivateBucket }: DataExportDeps, key: string) =>
  s3
    .send(
      new DeleteObjectsCommand({
        Bucket: s3PrivateBucket,
        Delete: { Objects: [{ Key: key }] },
      }),
    )
    .catch(() => {})

export const getDataExportFileName = (finishedAt: Date) =>
  `taiyo-data-${finishedAt.toISOString().slice(0, 10)}.zip`

/**
 * Builds the user's archive into the private bucket and marks the export ready. Returns what
 * the worker needs to tell the user, or undefined when there is nothing to do: the export is
 * no longer pending, or the account was deleted while it was built.
 */
export const buildDataExport = async (deps: DataExportDeps, { exportId }: { exportId: string }) => {
  const { db, s3, s3PrivateBucket } = deps
  const pending = await db
    .selectFrom("dataExports as e")
    .innerJoin("users as u", "u.id", "e.userId")
    .select(["e.userId", "u.email", "u.displayUsername"])
    .where("e.id", "=", exportId)
    .where("e.status", "=", "PENDING")
    .executeTakeFirst()

  if (pending === undefined) {
    return undefined
  }

  const key = getDataExportKey(pending.userId, exportId)
  const out = new PassThrough()
  const archive = createArchive(out)
  const upload = new Upload({
    client: s3,
    params: { Bucket: s3PrivateBucket, Key: key, Body: out, ContentType: "application/zip" },
    queueSize: 2,
  })
  // A failed upload stops reading: the writer would wait for a drain that never comes.
  const uploaded = upload.done().catch((err: unknown) => {
    out.destroy(err instanceof Error ? err : new Error(String(err)))

    throw err
  })

  try {
    await Promise.all([writeArchive(archive, deps, pending.userId), uploaded])
  } catch (err) {
    out.destroy()
    await upload.abort().catch(() => {})
    await uploaded.catch(() => {})
    await deleteArchive(deps, key)

    throw err
  }

  const byteSize = archive.getByteSize()
  const expiresAt = new Date(Date.now() + config.dataExports.expiryDays * 24 * 60 * 60 * 1000)
  const ready = await db.transaction().execute(async (trx) => {
    const row = await trx
      .updateTable("dataExports")
      .set({
        status: "READY",
        byteSize: String(byteSize),
        finishedAt: sql<Date>`CURRENT_TIMESTAMP`,
        expiresAt,
      })
      .where("id", "=", exportId)
      .where("status", "=", "PENDING")
      .returning("id")
      .executeTakeFirst()

    if (row !== undefined) {
      await trx
        .insertInto("notifications")
        .values({ userId: pending.userId, type: "DATA_EXPORT_READY", payload: { exportId } })
        .execute()
    }

    return row
  })

  if (ready === undefined) {
    await deleteArchive(deps, key)

    return undefined
  }

  return {
    exportId,
    userId: pending.userId,
    email: pending.email,
    name: pending.displayUsername,
    byteSize,
    expiresAt,
  }
}

/** Marks an export failed once its job gave up, so the user can ask again. */
export const failDataExport = async ({ db }: { db: Kysely<DB> }, exportId: string) => {
  await db
    .updateTable("dataExports")
    .set({ status: "FAILED", finishedAt: sql<Date>`CURRENT_TIMESTAMP` })
    .where("id", "=", exportId)
    .where("status", "=", "PENDING")
    .execute()
}

/**
 * Deletes the archives past their expiry, and fails the exports whose job was lost: neither
 * a worker restart nor a dropped job may leave the user waiting for ever. An archive is deleted
 * before its row says so, so a failed deletion is retried on the next run.
 */
export const expireDataExports = async (deps: DataExportDeps, now = new Date()) => {
  const { db, s3, s3PrivateBucket } = deps
  const staleBefore = new Date(now.getTime() - config.dataExports.staleAfterHours * 60 * 60 * 1000)
  const due = await db
    .selectFrom("dataExports")
    .select(["id", "userId", "status"])
    .where((eb) =>
      eb.or([
        eb.and([eb("status", "=", "READY"), eb("expiresAt", "<=", now)]),
        eb.and([eb("status", "=", "PENDING"), eb("createdAt", "<", staleBefore)]),
      ]),
    )
    .execute()

  if (due.length === 0) {
    return { expired: [], failed: [] }
  }

  for (let i = 0; i < due.length; i += 1000) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: s3PrivateBucket,
        Delete: {
          Objects: due.slice(i, i + 1000).map(({ id, userId }) => ({
            Key: getDataExportKey(userId, id),
          })),
        },
      }),
    )
  }

  const idsOf = (status: "READY" | "PENDING") =>
    due.filter((row) => row.status === status).map(({ id }) => id)
  const [expired, failed] = await Promise.all([
    idsOf("READY").length === 0
      ? []
      : db
          .updateTable("dataExports")
          .set({ status: "EXPIRED" })
          .where("id", "in", idsOf("READY"))
          .where("status", "=", "READY")
          .returning(["id", "userId"])
          .execute(),
    idsOf("PENDING").length === 0
      ? []
      : db
          .updateTable("dataExports")
          .set({ status: "FAILED", finishedAt: sql<Date>`CURRENT_TIMESTAMP` })
          .where("id", "in", idsOf("PENDING"))
          .where("status", "=", "PENDING")
          .returning(["id", "userId"])
          .execute(),
  ])

  return { expired, failed }
}
