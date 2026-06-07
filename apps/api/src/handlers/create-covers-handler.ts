import { NewCover } from "@taiyomoe/db"
import { getCoverKey } from "@taiyomoe/s3"
import { syncMedia } from "@taiyomoe/search"
import { extensionForMimeType } from "@taiyomoe/utils"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkImages } from "../middlewares/check-images-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingSchema,
  fileSchema,
  languageSchema,
} from "../utils/schemas"
import { uploadFile } from "../utils/upload-file"

const createCoversSchema = z.object({
  covers: z
    .object({
      file: fileSchema("The file of the cover."),
      language: languageSchema("The language of the cover."),
      contentRating: contentRatingSchema("The content rating of the cover."),
      main: z.boolean().default(false).meta({
        description:
          "Whether this cover should become the main cover. If true, the previous main cover is replaced.",
        example: false,
      }),
      volume: z.number().min(1).optional().meta({
        description: "The volume of the cover.",
        example: 1,
      }),
    })
    .array()
    .min(1)
    .meta({
      description: "The covers to add to the media.",
      examples: [
        {
          file: "cover-vol-3.jpg",
          language: "en",
          contentRating: "NORMAL",
          main: false,
          volume: 3,
        },
      ],
    })
    .refine((data) => data.filter((c) => c.main).length <= 1, {
      message: "At most one cover can be marked as main.",
    }),
})

export const createCoversHandler = new Hono().post(
  "/:id/covers",
  describeRoute({
    summary: "Add covers to a media",
    description:
      "Adds one or more covers to a media. At most one of the uploaded covers may be marked as the new main cover; if so, it replaces the previous main cover.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Medias"],
    requestBody: {
      content: {
        "multipart/form-data": await resolver(createCoversSchema).toOpenAPISchema(),
      },
    },
    responses: {
      201: {
        description: "Covers added.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  ids: z
                    .uuid()
                    .array()
                    .meta({ description: "The IDs of the newly created covers." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The request data failed validation or an uploaded image is invalid.",
      }),
    },
  }),
  withAuth("update", "Media"),
  validateFormData(createCoversSchema),
  checkImages(),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, s3, log, media, user } = c.var
    const body = c.var.formData!
    const coverRows = await Promise.all(
      body.covers.map(async (cover) => {
        const id = crypto.randomUUID()

        await uploadFile(
          { s3, log },
          getCoverKey(media.id, `${id}.${extensionForMimeType(cover.file.type)}`),
          cover.file,
        )

        return {
          id,
          mediaId: media.id,
          volume: cover.volume !== undefined ? String(cover.volume) : null,
          language: cover.language,
          contentRating: cover.contentRating,
          isMainCover: cover.main,
          uploaderId: user.id,
        } satisfies NewCover
      }),
    )

    await db.insertInto("covers").values(coverRows).execute()

    const newMain = coverRows.find((row) => row.isMainCover)

    if (newMain) {
      await db
        .updateTable("covers")
        .set({ isMainCover: false })
        .where("mediaId", "=", media.id)
        .where("id", "!=", newMain.id)
        .where("isMainCover", "=", true)
        .execute()
    }

    c.var.afterCommit(() => syncMedia(c.var.db, media.id))

    return c.ok({ ids: coverRows.map((row) => row.id) })
  },
)
