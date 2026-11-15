import { FLAGS, SUPPORTED_LANGUAGES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema, sortDirectionSchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withChapterDetails } from "../utils/latest-chapters"
import { NO_VOLUME, selectMediaChapters, selectReadChapterNumber } from "../utils/media-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  latestChapterSchema,
} from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  contentRating: contentRatingsQuerySchema,
  language: z
    .enum(SUPPORTED_LANGUAGES)
    .optional()
    .meta({ description: "Only list chapters in this language.", example: "en" }),
  volume: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .optional()
    .meta({
      description: `Only list chapters of this volume. Use \`${NO_VOLUME}\` for chapters without a volume.`,
      example: "12",
    }),
  search: z.string().trim().max(100).optional().meta({
    description:
      "Only list chapters whose number starts with this text or whose title contains it, ignoring case.",
    example: "11",
  }),
  sort: z.enum(["number", "createdAt"]).default("number").meta({
    description: "Whether to sort by chapter number or by release date.",
    example: "number",
  }),
  order: sortDirectionSchema.default("asc"),
  unread: z.stringbool().default(false).meta({
    description:
      "Whether to only list the chapter numbers you have not read. Requires you to be signed in.",
    example: false,
  }),
})
const chapterListItemSchema = latestChapterSchema.extend({
  flag: z.enum(FLAGS).meta({ description: "The moderation flag of the chapter.", example: "OK" }),
  read: z.boolean().meta({
    description:
      "Whether you have read a chapter with this number, in any language. Always `false` when you are signed out.",
  }),
})

export const listChaptersHandler = new Hono().get(
  "/:id/chapters",
  describeRoute({
    summary: "List a media's chapters",
    description:
      "Lists the published chapters of a media, filtered by content rating and optionally by language, volume, text and read state, lowest chapter number first by default. A chapter counts as the stricter of its own rating and its media's. Signed-in viewers also see which chapter numbers they have read, and can list only the unread ones.\n\n**Authentication:** optional.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The matching chapters of the media.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(chapterListItemSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: "`unread` is set and you are not signed in.",
        404: "No media with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkMedia(),
  async (c) => {
    const { db, media } = c.var
    const { page, perPage, contentRating, sort, order, unread, ...filters } = c.var.query
    const session = await c.var.auth.api.getSession({ headers: c.req.raw.headers })
    const userId = session?.user.id

    if (unread && userId === undefined) {
      return c.fail("UNAUTHORIZED")
    }

    const base = selectMediaChapters(db, media.id, {
      contentRatings: contentRating,
      ...filters,
    }).where((eb) =>
      unread && userId !== undefined
        ? eb.not(eb.exists(selectReadChapterNumber(db, userId)))
        : eb.and([]),
    )
    const rows = base
      .innerJoin("users", "users.id", "chapters.uploaderId")
      .select((eb) => [
        "chapters.id",
        "chapters.title",
        "chapters.number",
        "chapters.volume",
        "chapters.language",
        "chapters.contentRating",
        "chapters.flag",
        "chapters.createdAt",
        "chapters.externalUrl",
        "chapters.isExternal",
        "users.id as uploaderId",
        "users.username as uploaderUsername",
        "users.displayUsername as uploaderDisplayUsername",
        "users.image as uploaderImage",
        "users.nameEffect as uploaderNameEffect",
        "users.avatarBorder as uploaderAvatarBorder",
        userId === undefined
          ? sql<boolean>`false`.as("read")
          : eb.exists(selectReadChapterNumber(db, userId)).$castTo<boolean>().as("read"),
      ])
    const ordered =
      sort === "number"
        ? rows
            .orderBy("chapters.number", order)
            .orderBy("chapters.language", "asc")
            .orderBy("chapters.id", "asc")
        : rows.orderBy("chapters.createdAt", order).orderBy("chapters.id", order)
    const [items, totalRow] = await Promise.all([
      ordered
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(db.fn.countAll().as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(await withChapterDetails(db, items), {
      page,
      perPage,
      total: Number(totalRow.count),
    })
  },
)
