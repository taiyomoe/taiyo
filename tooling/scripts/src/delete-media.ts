import { defineCommand } from "citty"
import { config as loadEnv } from "dotenv"
import { resolve } from "node:path"
import { z } from "zod"

export default defineCommand({
  meta: {
    name: "delete-media",
    description: "Hard-delete a media and all of its dependents (DB, S3, Meilisearch).",
  },
  args: {
    mediaId: {
      type: "positional",
      required: true,
      description: "The ID of the media to delete.",
    },
    envFile: {
      type: "string",
      description: "Path to the env file with production credentials.",
      default: ".env.prod",
    },
    dryRun: {
      type: "boolean",
      description: "Print what would be deleted, delete nothing.",
      default: false,
    },
    storageOnly: {
      type: "boolean",
      description:
        "Skip the database: only delete S3 objects and the search document. For a run whose database delete committed and whose storage delete failed.",
      default: false,
    },
  },
  run: async ({ args }) => {
    const { mediaId, dryRun, storageOnly } = args

    if (!z.uuid().safeParse(mediaId).success) {
      console.error("mediaId must be a UUID.")
      process.exit(1)
    }

    const envPath = resolve(process.cwd(), args.envFile)
    const result = loadEnv({ path: envPath, override: true })

    if (result.error) {
      console.error(`Failed to load env file at ${envPath}: ${result.error.message}`)
      process.exit(1)
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_DMCA

    if (webhookUrl === undefined || webhookUrl === "") {
      console.error("DISCORD_WEBHOOK_DMCA is not set in the env file.")
      process.exit(1)
    }

    // These packages validate their env vars on import, so they load after the env file.
    const { getDb } = await import("@taiyomoe/db")
    const { DeleteObjectsCommand, getS3Bucket, getS3Client, ListObjectsV2Command } =
      await import("@taiyomoe/s3")
    const { getMeiliClient, SEARCH_INDEXES } = await import("@taiyomoe/search")
    const { createAuditLogDrain, mediaAudit, systemActor } = await import("@taiyomoe/audit")
    const { audit } = await import("evlog")
    const db = getDb()
    const s3Client = getS3Client()
    const meiliClient = getMeiliClient()
    const prefix = `medias/${mediaId}/`
    const exit = async (code: number): Promise<never> => {
      await db.destroy()
      process.exit(code)
    }
    const sweepStorage = async (remove: boolean) => {
      let continuationToken: string | undefined
      let count = 0

      do {
        const list = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: getS3Bucket(),
            Prefix: prefix,
            ContinuationToken: continuationToken,
          }),
        )
        const objects = list.Contents ?? []

        if (remove && objects.length > 0) {
          await s3Client.send(
            new DeleteObjectsCommand({
              Bucket: getS3Bucket(),
              Delete: { Objects: objects.map((o) => ({ Key: o.Key })) },
            }),
          )
        }

        count += objects.length
        continuationToken = list.IsTruncated === true ? list.NextContinuationToken : undefined
      } while (continuationToken !== undefined && continuationToken !== "")

      return count
    }

    if (!storageOnly) {
      const media = await db
        .selectFrom("medias")
        .select("id")
        .where("id", "=", mediaId)
        .executeTakeFirst()

      if (media === undefined) {
        console.error(
          `Media ${mediaId} does not exist. If a previous run deleted it but failed on storage, rerun with --storage-only.`,
        )
        await exit(1)
      }
    }

    let stats:
      | {
          mainTitle: string
          chapters: string
          covers: string
          banners: string
          titles: string
          userLibraryEntries: string
          userHistories: string
        }
      | undefined

    if (!storageOnly) {
      console.log("Gathering pre-deletion stats...")

      const [mainTitle, chapters, covers, banners, titles, userLibraryEntries, userHistories] =
        await Promise.all([
          db
            .selectFrom("titles")
            .select("title")
            .where("mediaId", "=", mediaId)
            .where("isMainTitle", "=", true)
            .limit(1)
            .executeTakeFirst(),
          db
            .selectFrom("chapters")
            .select(db.fn.countAll<string>().as("count"))
            .where("mediaId", "=", mediaId)
            .executeTakeFirstOrThrow(),
          db
            .selectFrom("covers")
            .select(db.fn.countAll<string>().as("count"))
            .where("mediaId", "=", mediaId)
            .executeTakeFirstOrThrow(),
          db
            .selectFrom("banners")
            .select(db.fn.countAll<string>().as("count"))
            .where("mediaId", "=", mediaId)
            .executeTakeFirstOrThrow(),
          db
            .selectFrom("titles")
            .select(db.fn.countAll<string>().as("count"))
            .where("mediaId", "=", mediaId)
            .executeTakeFirstOrThrow(),
          db
            .selectFrom("userLibraryEntries")
            .select(db.fn.countAll<string>().as("count"))
            .where("mediaId", "=", mediaId)
            .executeTakeFirstOrThrow(),
          db
            .selectFrom("userHistories")
            .innerJoin("chapters", "chapters.id", "userHistories.chapterId")
            .select(db.fn.countAll<string>().as("count"))
            .where("chapters.mediaId", "=", mediaId)
            .executeTakeFirstOrThrow(),
        ])

      stats = {
        mainTitle: mainTitle?.title ?? "(unknown)",
        chapters: chapters.count,
        covers: covers.count,
        banners: banners.count,
        titles: titles.count,
        userLibraryEntries: userLibraryEntries.count,
        userHistories: userHistories.count,
      }

      console.log(`Media: ${stats.mainTitle} (${mediaId})`)
      console.log(`- Chapters: ${stats.chapters}`)
      console.log(`- Covers: ${stats.covers}`)
      console.log(`- Banners: ${stats.banners}`)
      console.log(`- Titles: ${stats.titles}`)
      console.log(`- User library entries: ${stats.userLibraryEntries}`)
      console.log(`- User history entries: ${stats.userHistories}`)
    }

    if (dryRun) {
      console.log(`Listing S3 objects under ${prefix}...`)
      console.log(`Dry run: ${await sweepStorage(false)} S3 object(s) would be deleted.`)
      await exit(0)
    }

    if (!storageOnly) {
      console.log("Running DB transaction...")

      await db.transaction().execute(async (trx) => {
        // Every table under a media references it ON DELETE CASCADE: one delete removes them, and a RESTRICT added later fails here, before storage is touched.
        const deleted = await trx.deleteFrom("medias").where("id", "=", mediaId).executeTakeFirst()

        if (deleted.numDeletedRows !== 1n) {
          throw new Error(`Expected to delete 1 media row, deleted ${deleted.numDeletedRows}.`)
        }
      })

      console.log("DB transaction committed.")
    }

    console.log(`Deleting S3 objects under ${prefix}...`)

    const deletedObjects = await sweepStorage(true)

    console.log(`Deleted ${deletedObjects} S3 object(s).`)

    console.log("Deleting Meilisearch document...")

    try {
      await meiliClient.index(SEARCH_INDEXES.MEDIAS).deleteDocument(mediaId).waitTask()
    } catch (err) {
      console.warn(
        "Failed to delete the Meilisearch document; the search outbox will remove it on the worker's next drain.",
        err,
      )
    }

    if (stats !== undefined) {
      console.log("Writing audit log...")

      const event = audit(
        mediaAudit.PURGE({
          actor: systemActor("delete-media-cli"),
          target: {
            id: mediaId,
            mainTitle: stats.mainTitle,
            chapters: Number(stats.chapters),
            s3Objects: deletedObjects,
          },
          outcome: "success",
        }),
      )

      // A standalone audit drains in the background, which process.exit would cut short.
      if (event !== null) {
        await createAuditLogDrain(db)({ event })
      }
    }

    console.log("Sending Discord webhook...")

    const fmt = (count: string | number) => Number(count).toLocaleString("en-US")
    const content = [
      `🗑️ **Media deleted**: ${stats?.mainTitle ?? "(unknown)"} (\`${mediaId}\`)`,
      ``,
      ...(stats === undefined
        ? []
        : [
            `- **Chapters**: ${fmt(stats.chapters)}`,
            `- **Covers**: ${fmt(stats.covers)}`,
            `- **Banners**: ${fmt(stats.banners)}`,
            `- **Titles**: ${fmt(stats.titles)}`,
            `- **User history entries**: ${fmt(stats.userHistories)}`,
            `- **User library entries**: ${fmt(stats.userLibraryEntries)}`,
          ]),
      `- **S3 objects deleted**: ${fmt(deletedObjects)}`,
    ].join("\n")
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    if (!webhookResponse.ok) {
      console.error(
        `Discord webhook failed: ${webhookResponse.status} ${await webhookResponse.text()}`,
      )
      await exit(1)
    }

    console.log(`Done. Media ${mediaId} fully removed.`)
    await exit(0)
  },
})
