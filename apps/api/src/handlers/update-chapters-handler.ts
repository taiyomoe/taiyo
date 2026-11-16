import { chapterAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { getChapterTargets } from "../utils/chapter-target"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, languageSchema } from "../utils/schemas"

const updateChaptersSchema = z
  .object({
    chapterIds: bulkIdsSchema("chapters", [
      "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
      "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
    ]),
    volume: z
      .string()
      .trim()
      .min(1)
      .max(config.input.maxVolumeLength)
      .nullable()
      .exactOptional()
      .meta({ description: "The volume of the chapters, or `null` to clear it.", example: "12" }),
    language: languageSchema("The language of the chapters.").exactOptional(),
    groupIds: z
      .array(z.uuid())
      .max(config.input.maxChapterGroups)
      .transform((ids) => [...new Set(ids)])
      .exactOptional()
      .meta({
        description:
          "The groups credited on the chapters, replacing the current ones. An empty list credits no group.",
        example: ["4d8a22ba-d8a0-4a98-b4f3-1d630fbd7de1"],
      }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: "At least one field must be provided.",
  })
const skippedChapterSchema = skippedSchema(
  "chapter",
  ["NOT_FOUND", "FORBIDDEN"],
  "Why the chapter was left alone: it does not exist, or you cannot make this change to it.",
)

export const updateChaptersHandler = new Hono().patch(
  "/",
  describeRoute({
    summary: "Update chapters in bulk",
    description:
      "Sets the same `volume`, `language` or credited groups on several chapters at once. At least one field is required, and omitted fields are left unchanged. Chapters that do not exist, or that you cannot update or credit these groups on, are skipped and reported.\n\n**Required access:** for each chapter, the same access as updating it, plus crediting and uncrediting the groups that change.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The updated and skipped chapters.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("chapters", "updated", skippedChapterSchema)),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "One of the groups does not exist.",
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(chapterAudit.UPDATE_MANY),
  withAuth(),
  validateJson(updateChaptersSchema),
  withTransaction,
  async (c) => {
    const { can, db } = c.var
    const { chapterIds, groupIds, ...updates } = c.var.json

    if (groupIds !== undefined && groupIds.length > 0) {
      const groups = await db
        .selectFrom("groups")
        .select("id")
        .where("id", "in", groupIds)
        .where("deletedAt", "is", null)
        .execute()

      if (groups.length !== groupIds.length) {
        return c.fail("GROUP_NOT_FOUND")
      }
    }

    const rows = await db
      .selectFrom("chapters")
      .innerJoin("medias", "medias.id", "chapters.mediaId")
      .select(["chapters.id", "chapters.uploaderId", "chapters.status"])
      .where("chapters.id", "in", chapterIds)
      .where("chapters.deletedAt", "is", null)
      .where("medias.deletedAt", "is", null)
      .forUpdate("chapters")
      .execute()
    const { found, missing } = partitionFound(chapterIds, rows)
    const targets = await getChapterTargets(db, found)
    const changes = found.flatMap((chapter) => {
      const target = targets.get(chapter.id)

      if (target === undefined) {
        return []
      }

      const added = (groupIds ?? []).filter((id) => !target.groupIds.includes(id))
      const removed =
        groupIds === undefined ? [] : target.groupIds.filter((id) => !groupIds.includes(id))
      const allowed =
        can("chapter.update", target) &&
        // A scheduled chapter some people may only reschedule, not edit.
        (chapter.status !== "SCHEDULED" ||
          can("chapter.update", { ...target, status: "PUBLISHED" })) &&
        added.every((groupId) => can("chapter.credit", { chapter: target, groupId })) &&
        removed.every((groupId) => can("chapter.uncredit", { chapter: target, groupId }))

      return [{ id: chapter.id, allowed, added, removed }]
    })
    const done = changes.filter((change) => change.allowed).map((change) => change.id)

    if (done.length > 0 && Object.keys(updates).length > 0) {
      await db.updateTable("chapters").set(updates).where("id", "in", done).execute()
    }

    for (const change of changes.filter((item) => item.allowed)) {
      if (change.removed.length > 0) {
        await db
          .deleteFrom("chapterGroups")
          .where("chapterId", "=", change.id)
          .where("groupId", "in", change.removed)
          .execute()
      }

      if (change.added.length > 0) {
        await db
          .insertInto("chapterGroups")
          .values(change.added.map((groupId) => ({ chapterId: change.id, groupId })))
          .execute()
      }
    }

    c.var.audit.set({
      changes: {
        after: { chapterIds: done, ...updates, ...(groupIds === undefined ? {} : { groupIds }) },
      },
    })

    return c.ok({
      done,
      skipped: [
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
        ...changes
          .filter((change) => !change.allowed)
          .map((change) => ({ id: change.id, reason: "FORBIDDEN" as const })),
      ],
    })
  },
)
