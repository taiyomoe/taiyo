import { MEDIA_STATUSES, MEDIA_TYPES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkList } from "../middlewares/check-list-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getMainCoverUrls, getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingSchema,
  contentRatingsQuerySchema,
} from "../utils/schemas"
import {
  listSummarySchema,
  selectListSummaries,
  toListSummaries,
  utcTimestampSql,
} from "../utils/user-lists"
import { isBannedSql } from "../utils/user-moderation"

const querySchema = z.object({ contentRating: contentRatingsQuerySchema })
const listDetailSchema = listSummarySchema.extend({
  hiddenItemCount: z.int().meta({
    description: "Titles on the list left out because they don't match the requested ratings.",
  }),
  items: z
    .object({
      mediaId: z.uuid(),
      position: z.int(),
      addedAt: z.iso.datetime(),
      title: z.string().nullable().meta({ description: "The main title of the media." }),
      coverUrl: z.url().nullable().meta({ description: "URL of the media's main cover." }),
      type: z.enum(MEDIA_TYPES),
      status: z.enum(MEDIA_STATUSES),
      contentRating: contentRatingSchema("The content rating of the media."),
    })
    .array(),
})

export const getListHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a list",
    description:
      "Returns a list with its titles in position order, filtered by content rating. PRIVATE lists are only visible to their owner.\n\n**Authentication:** none for PUBLIC lists; owner-only for PRIVATE.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "List details.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(listDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No list with the given id exists or you cannot see it.",
        422: "The provided id or query parameters are not valid.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkList(),
  withOptionalAuth,
  async (c) => {
    const { db, list, viewer } = c.var
    const { contentRating } = c.var.query
    const isOwner = viewer !== null && viewer.id === list.userId
    const row = await selectListSummaries(db, viewer?.id ?? null)
      .where("userLists.id", "=", list.id)
      .select(isBannedSql.as("ownerBanned"))
      .executeTakeFirst()

    if (row === undefined) {
      return c.fail("LIST_NOT_FOUND")
    }

    const { ownerBanned, ...summaryRow } = row

    if (!isOwner && (list.visibility === "PRIVATE" || ownerBanned)) {
      return c.fail("LIST_NOT_FOUND")
    }

    const items = await db
      .selectFrom("userListItems")
      .innerJoin("medias", "medias.id", "userListItems.mediaId")
      .where("userListItems.listId", "=", list.id)
      .where("medias.deletedAt", "is", null)
      .where("medias.contentRating", "in", contentRating)
      .select([
        "userListItems.mediaId",
        "userListItems.position",
        utcTimestampSql("userListItems.addedAt").as("addedAt"),
        "medias.type",
        "medias.status",
        "medias.contentRating",
      ])
      .orderBy("userListItems.position", "asc")
      .orderBy("userListItems.addedAt", "asc")
      .execute()
    const mediaIds = items.map((item) => item.mediaId)
    const [titles, coverUrls, [summary]] = await Promise.all([
      getMainTitles(db, mediaIds),
      getMainCoverUrls(db, mediaIds),
      toListSummaries(db, [summaryRow], contentRating),
    ])

    if (summary === undefined) {
      return c.fail("LIST_NOT_FOUND")
    }

    return c.ok({
      ...summary,
      hiddenItemCount: summary.itemCount - items.length,
      items: items.map((item) => ({
        ...item,
        title: titles.get(item.mediaId) ?? null,
        coverUrl: coverUrls.get(item.mediaId) ?? null,
      })),
    })
  },
)
