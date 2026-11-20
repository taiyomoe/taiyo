import { mediaAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import {
  applyMediaEdit,
  checkMediaEdit,
  diffMediaEdit,
  mergeMediaEdits,
  normalizeMediaEdit,
  pickFields,
  readMediaEdits,
} from "../utils/media-edit"
import {
  copyChapterPages,
  deleteKeys,
  foldChapter,
  isMergeBusy,
  mergeReaders,
  type PageCopy,
  planChapterMerge,
} from "../utils/media-merge"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const MAX_MERGED_MEDIAS = 10
const mergeMediasSchema = z.object({
  mediaIds: z
    .array(z.uuid())
    .min(1)
    .max(MAX_MERGED_MEDIAS)
    .transform((ids) => [...new Set(ids)])
    .meta({
      description: `The IDs of the medias to merge into this one, ${MAX_MERGED_MEDIAS} at most, in the order their details are taken. Duplicates are ignored.`,
      example: ["4e26b80f-6661-4f5f-93b4-6dfed052bbed", "ed6d5cba-fbf9-40b3-8190-3c5d034e8413"],
    }),
})

export const mergeMediasHandler = new Hono().post(
  "/:id/merge",
  describeRoute({
    summary: "Merge medias into a media",
    description:
      "Merges duplicates into a media, then deletes them. The media takes their chapters with their readers and comments, their library and list entries, and the titles, synopses, tags, links, staff credits and dates it does not have. A chapter of a release the media already has is folded into the media's copy.\n\n**Required roles:** admin.",
    tags: ["Medias"],
    responses: {
      201: {
        description: "Medias merged.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the media." }),
                  mergedMediaIds: z
                    .uuid()
                    .array()
                    .meta({ description: "The IDs of the medias merged into it." }),
                  movedChapters: z.int().meta({
                    description: "The number of chapters moved to the media.",
                    example: 4,
                  }),
                  foldedChapters: z.int().meta({
                    description:
                      "The number of chapters folded into the media's copy of the same release.",
                    example: 120,
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists, or one of the medias to merge does not exist.",
        409: "One of the medias to merge has another flag, a link another media already has, or chapters or a MangaDex sync still being processed.",
        422: "The provided ID is not a valid UUID, the request body failed validation, or it lists the media itself.",
      }),
    },
  }),
  audited(mediaAudit.MERGE),
  withAuth("media.merge"),
  validateJson(mergeMediasSchema),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, media, user } = c.var
    const duplicateIds = c.var.json.mediaIds

    if (duplicateIds.includes(media.id)) {
      return c.fail("MEDIA_MERGE_INTO_ITSELF")
    }

    const medias = await db
      .selectFrom("medias")
      .select(["id", "flag"])
      .where("id", "in", [media.id, ...duplicateIds])
      .where("deletedAt", "is", null)
      .orderBy("id")
      .forUpdate()
      .execute()
    const flag = medias.find((row) => row.id === media.id)?.flag

    if (flag === undefined || medias.length !== duplicateIds.length + 1) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    if (medias.some((row) => row.flag !== flag)) {
      return c.fail("MEDIA_FLAG_MISMATCH")
    }

    if (await isMergeBusy(db, [media.id, ...duplicateIds])) {
      return c.fail("MEDIA_MERGE_BUSY")
    }

    const edits = await readMediaEdits(db, [media.id, ...duplicateIds])
    const current = edits.get(media.id)

    if (current === undefined) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const duplicates = duplicateIds.flatMap((id) => {
      const edit = edits.get(id)

      return edit === undefined ? [] : [edit]
    })
    const edit = diffMediaEdit(current, normalizeMediaEdit(mergeMediaEdits(current, duplicates)))

    // The duplicates hand their links over to the media.
    await db.updateTable("medias").set({ links: {} }).where("id", "in", duplicateIds).execute()

    const conflict = await checkMediaEdit(db, media.id, pickFields(edit, ["links"]))

    if (conflict?.code === "MEDIA_LINK_CONFLICT") {
      return c.fail(conflict.code, conflict.details)
    }

    await applyMediaEdit(db, { mediaId: media.id, actorId: user.id, edit })

    const { moved, folds } = await planChapterMerge(db, { mediaId: media.id, duplicateIds })

    for (const fold of folds) {
      await foldChapter(db, { fold, actorId: user.id })
    }

    if (moved.length > 0) {
      await db
        .updateTable("chapters")
        .set({ mediaId: media.id })
        .where(
          "id",
          "in",
          moved.map((chapter) => chapter.id),
        )
        .execute()
    }

    for (const duplicateId of duplicateIds) {
      await mergeReaders(db, { mediaId: media.id, duplicateId })
    }

    await db
      .updateTable("medias")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "in", duplicateIds)
      .execute()

    const copies: PageCopy[] = []

    c.var.onRollback(() =>
      deleteKeys(
        c.var,
        copies.map((copy) => copy.into),
      ),
    )
    await copyChapterPages(c.var, { mediaId: media.id, chapters: moved, copies })
    c.var.afterCommit(() =>
      deleteKeys(
        c.var,
        copies.map((copy) => copy.from),
      ),
    )

    const changes = auditChanges(current, edit)

    c.var.audit.set({
      changes: {
        before: { media: changes?.before ?? null },
        after: {
          media: changes?.after ?? null,
          mergedMediaIds: duplicateIds,
          movedChapterIds: moved.map((chapter) => chapter.id),
          foldedChapters: folds.map(({ from, into }) => ({ id: from.id, into: into.id })),
        },
      },
    })

    return c.ok({
      id: media.id,
      mergedMediaIds: duplicateIds,
      movedChapters: moved.length,
      foldedChapters: folds.length,
    })
  },
)
