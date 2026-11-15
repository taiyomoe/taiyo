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
import { listSummarySchema, selectListSummaries, toListSummary } from "../utils/user-lists"
import { isBannedSql } from "../utils/user-moderation"

const querySchema = z.object({ contentRating: contentRatingsQuerySchema })
const listDetailSchema = listSummarySchema.extend({
  hiddenItemCount: z.int().meta({
    description:
      "The number of titles on the list left out because they do not match the requested content ratings.",
    example: 1,
  }),
  items: z
    .object({
      mediaId: z.uuid().meta({ description: "The ID of the media." }),
      position: z.int().meta({ description: "The position of the media on the list.", example: 0 }),
      addedAt: z.iso.datetime().meta({ description: "When the media was added to the list." }),
      title: z.string().nullable().meta({
        description: "The main title of the media, if any.",
        example: "One Punch Man",
      }),
      coverUrl: z
        .url()
        .nullable()
        .meta({ description: "The URL of the main cover of the media, if any." }),
      type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media.", example: "MANGA" }),
      status: z
        .enum(MEDIA_STATUSES)
        .meta({ description: "The release status of the media.", example: "RELEASING" }),
      contentRating: contentRatingSchema("The content rating of the media."),
    })
    .array()
    .meta({ description: "The titles on the list that match the requested content ratings." }),
})

export const getListHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a list",
    description:
      "Returns a list with its titles in position order, keeping only the titles that match the requested content ratings. Only the owner can see a `PRIVATE` list, or a list of a banned user. Signed-in viewers also see whether they upvoted the list.\n\n**Authentication:** optional.",
    tags: ["Custom lists"],
    responses: {
      200: {
        description: "The list.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(listDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No list with the given ID exists, or you cannot see it.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
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
        "userListItems.addedAt",
        "medias.type",
        "medias.status",
        "medias.contentRating",
      ])
      .orderBy("userListItems.position", "asc")
      .orderBy("userListItems.addedAt", "asc")
      .execute()
    const mediaIds = items.map((item) => item.mediaId)
    const [titles, coverUrls, summary] = await Promise.all([
      getMainTitles(db, mediaIds),
      getMainCoverUrls(db, mediaIds),
      toListSummary(db, summaryRow, contentRating),
    ])

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
