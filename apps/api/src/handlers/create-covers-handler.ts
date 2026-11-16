import type { NewCover } from "@taiyomoe/db"
import { coverAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { putImage } from "../image-store"
import { audited } from "../middlewares/audited-middleware"
import { checkImages } from "../middlewares/check-images-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { transcodeSlot } from "../middlewares/transcode-slot-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingSchema,
  fileSchema,
  mediaLanguageSchema,
} from "../utils/schemas"

const createCoversSchema = z.object({
  covers: z
    .object({
      file: fileSchema("The image of the cover."),
      language: mediaLanguageSchema("The language of the cover."),
      contentRating: contentRatingSchema("The content rating of the cover."),
      main: z.boolean().default(false).meta({
        description:
          "Whether the cover becomes the main cover of the media, replacing the previous one.",
        example: false,
      }),
      volume: z.number().min(1).optional().meta({
        description: "The volume the cover belongs to.",
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
      "Adds one or more covers to a media. At most one of them can be marked as `main`, and it then replaces the previous main cover.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Covers"],
    responses: {
      201: {
        description: "Covers added.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  ids: z.uuid().array().meta({
                    description: "The IDs of the new covers, in the order they were sent.",
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
        404: "No media with the given ID exists.",
        451: "The media is locked, so no cover can be added.",
        422: `The provided ID is not a valid UUID, or the request body failed validation, or one of the images is invalid, larger than ${config.images.maxSizeBytes / 1024 / 1024} MB or has too many pixels or frames.`,
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(coverAudit.CREATE),
  withAuth("media.update"),
  rateLimit({ prefix: "create-covers", windowMs: 60_000, limit: 10 }),
  validateFormData(createCoversSchema),
  checkImages(),
  checkMedia({ refuseLocked: true }),
  transcodeSlot,
  withTransaction,
  async (c) => {
    const { db, media, user } = c.var
    const body = c.var.formData
    const coverRows = await Promise.all(
      body.covers.map(async (cover) => {
        const id = crypto.randomUUID()
        const { extension } = await putImage(
          c.var,
          { kind: "cover", mediaId: media.id, id },
          cover.file,
        )

        return {
          id,
          mediaId: media.id,
          extension,
          volume: cover.volume !== undefined ? String(cover.volume) : null,
          language: cover.language,
          contentRating: cover.contentRating,
          isMainCover: cover.main,
          uploaderId: user.id,
        } satisfies NewCover
      }),
    )

    if (coverRows.some((row) => row.isMainCover)) {
      await db
        .updateTable("covers")
        .set({ isMainCover: false })
        .where("mediaId", "=", media.id)
        .where("isMainCover", "=", true)
        .execute()
    }

    await db.insertInto("covers").values(coverRows).execute()

    c.var.audit.set({ target: { coverIds: coverRows.map((row) => row.id) } })

    return c.ok({ ids: coverRows.map((row) => row.id) })
  },
)
