import { defineCommand } from "citty"
import { config as loadEnv } from "dotenv"
import { resolve } from "node:path"

export default defineCommand({
  meta: {
    name: "delete-media",
    description: "Hard-delete a media and all of its dependents (S3, DB, Meilisearch).",
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
  },
  run: async ({ args }) => {
    const envPath = resolve(process.cwd(), args.envFile)
    const result = loadEnv({ path: envPath, override: true })

    if (result.error) {
      console.error(`Failed to load env file at ${envPath}: ${result.error.message}`)
      process.exit(1)
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_DMCA

    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_DMCA is not set in the env file.")
      process.exit(1)
    }

    const { db, sql } = await import("@taiyomoe/db")
    const { DeleteObjectsCommand, ListObjectsV2Command, s3Bucket, s3Client } =
      await import("@taiyomoe/s3")
    const { SEARCH_INDEXES, meiliClient } = await import("@taiyomoe/search")
    const { mediaId } = args
    const prefix = `medias/${mediaId}/`

    console.log("Gathering pre-deletion stats...")

    const statsResult = await sql<{
      mainTitle: string | null
      chapters: string
      covers: string
      banners: string
      titles: string
      trackers: string
      userHistory: string
      userLibrary: string
    }>`
      SELECT
        (
          SELECT title FROM "MediaTitle"
          WHERE "mediaId" = ${mediaId} AND "isMainTitle" = true
          LIMIT 1
        ) AS "mainTitle",
        (SELECT COUNT(*) FROM "MediaChapter" WHERE "mediaId" = ${mediaId}) AS chapters,
        (SELECT COUNT(*) FROM "MediaCover" WHERE "mediaId" = ${mediaId}) AS covers,
        (SELECT COUNT(*) FROM "MediaBanner" WHERE "mediaId" = ${mediaId}) AS banners,
        (SELECT COUNT(*) FROM "MediaTitle" WHERE "mediaId" = ${mediaId}) AS titles,
        (SELECT COUNT(*) FROM "MediaTracker" WHERE "mediaId" = ${mediaId}) AS trackers,
        (SELECT COUNT(*) FROM "UserHistory" WHERE "mediaId" = ${mediaId}) AS "userHistory",
        (
          (SELECT COUNT(*) FROM "UserLibrary", unnest(reading) e WHERE e->>'mediaId' = ${mediaId})
          + (SELECT COUNT(*) FROM "UserLibrary", unnest(rereading) e WHERE e->>'mediaId' = ${mediaId})
          + (SELECT COUNT(*) FROM "UserLibrary", unnest("planToRead") e WHERE e->>'mediaId' = ${mediaId})
          + (SELECT COUNT(*) FROM "UserLibrary", unnest(completed) e WHERE e->>'mediaId' = ${mediaId})
          + (SELECT COUNT(*) FROM "UserLibrary", unnest("onHold") e WHERE e->>'mediaId' = ${mediaId})
          + (SELECT COUNT(*) FROM "UserLibrary", unnest(dropped) e WHERE e->>'mediaId' = ${mediaId})
        ) AS "userLibrary"
    `.execute(db)
    const stats = statsResult.rows[0]!
    const mainTitle = stats.mainTitle ?? "(unknown)"

    console.log(`Deleting S3 objects under ${prefix}...`)

    let continuationToken: string | undefined
    let deletedObjects = 0

    do {
      const list = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: s3Bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      )
      const objects = list.Contents ?? []

      if (objects.length > 0) {
        await s3Client.send(
          new DeleteObjectsCommand({
            Bucket: s3Bucket,
            Delete: { Objects: objects.map((o) => ({ Key: o.Key! })) },
          }),
        )

        deletedObjects += objects.length
      }

      continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined
    } while (continuationToken)

    console.log(`Deleted ${deletedObjects} S3 object(s).`)

    console.log("Running DB transaction...")

    await db.transaction().execute(async (trx) => {
      await sql`DELETE FROM "UserHistory" WHERE "mediaId" = ${mediaId}`.execute(trx)

      await sql`
        UPDATE "UserLibrary"
        SET
          reading = ARRAY(SELECT e FROM unnest(reading) e WHERE e->>'mediaId' IS DISTINCT FROM ${mediaId}),
          rereading = ARRAY(SELECT e FROM unnest(rereading) e WHERE e->>'mediaId' IS DISTINCT FROM ${mediaId}),
          "planToRead" = ARRAY(SELECT e FROM unnest("planToRead") e WHERE e->>'mediaId' IS DISTINCT FROM ${mediaId}),
          completed = ARRAY(SELECT e FROM unnest(completed) e WHERE e->>'mediaId' IS DISTINCT FROM ${mediaId}),
          "onHold" = ARRAY(SELECT e FROM unnest("onHold") e WHERE e->>'mediaId' IS DISTINCT FROM ${mediaId}),
          dropped = ARRAY(SELECT e FROM unnest(dropped) e WHERE e->>'mediaId' IS DISTINCT FROM ${mediaId})
        WHERE
          EXISTS (SELECT 1 FROM unnest(reading) e WHERE e->>'mediaId' = ${mediaId})
          OR EXISTS (SELECT 1 FROM unnest(rereading) e WHERE e->>'mediaId' = ${mediaId})
          OR EXISTS (SELECT 1 FROM unnest("planToRead") e WHERE e->>'mediaId' = ${mediaId})
          OR EXISTS (SELECT 1 FROM unnest(completed) e WHERE e->>'mediaId' = ${mediaId})
          OR EXISTS (SELECT 1 FROM unnest("onHold") e WHERE e->>'mediaId' = ${mediaId})
          OR EXISTS (SELECT 1 FROM unnest(dropped) e WHERE e->>'mediaId' = ${mediaId})
      `.execute(trx)

      await sql`DELETE FROM "MediaChapter" WHERE "mediaId" = ${mediaId}`.execute(trx)
      await sql`DELETE FROM "MediaCover" WHERE "mediaId" = ${mediaId}`.execute(trx)
      await sql`DELETE FROM "MediaBanner" WHERE "mediaId" = ${mediaId}`.execute(trx)
      await sql`DELETE FROM "MediaTitle" WHERE "mediaId" = ${mediaId}`.execute(trx)
      await sql`DELETE FROM "MediaTracker" WHERE "mediaId" = ${mediaId}`.execute(trx)
      await sql`DELETE FROM "Media" WHERE id = ${mediaId}`.execute(trx)
    })

    console.log("DB transaction committed.")

    console.log("Deleting Meilisearch document...")
    await meiliClient.index(SEARCH_INDEXES.MEDIAS).deleteDocument(mediaId)

    console.log("Sending Discord webhook...")

    const fmt = (count: string) => Number(count).toLocaleString("en-US")
    const content = [
      `🗑️ **Media deleted**: ${mainTitle} (\`${mediaId}\`)`,
      ``,
      `- **Chapters**: ${fmt(stats.chapters)}`,
      `- **Covers**: ${fmt(stats.covers)}`,
      `- **Banners**: ${fmt(stats.banners)}`,
      `- **Titles**: ${fmt(stats.titles)}`,
      `- **Trackers**: ${fmt(stats.trackers)}`,
      `- **User history entries**: ${fmt(stats.userHistory)}`,
      `- **User library entries**: ${fmt(stats.userLibrary)}`,
      `- **S3 objects deleted**: ${deletedObjects.toLocaleString("en-US")}`,
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
      process.exit(1)
    }

    console.log(`Done. Media ${mediaId} fully removed.`)
    process.exit(0)
  },
})
