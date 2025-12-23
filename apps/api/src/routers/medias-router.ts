import { config } from "@taiyomoe/config"
import {
  MediaCountryOfOrigin,
  MediaDemography,
  MediaGenres,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkImages } from "../middlewares/check-images-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import {
  contentRatingSchema,
  fileSchema,
  languageSchema,
} from "../utils/schemas"

const createMediaSchema = z.object({
  titles: z
    .object({
      title: z.string().meta({
        description: "The title of the media for the given language.",
        example: "One Punch Man",
      }),
      language: languageSchema("The language of the title."),
      main: z.boolean().default(false).meta({
        description: "Whether the title is the main title of the media.",
        example: false,
      }),
      priority: z
        .int()
        .min(1)
        .optional()
        .meta({ description: "The priority of the title.", example: 1 }),
      isAcronym: z.boolean().default(false).meta({
        description: "Whether the title is an acronym.",
        example: false,
      }),
    })
    .array()
    .min(1)
    .meta({
      description:
        "The titles of the media. At least one title is required and exactly one main title is required.",
      examples: [
        {
          title: "One Punch Man",
          language: "en",
          main: true,
          priority: 1,
          isAcronym: false,
        },
        {
          title: "ワンパンマン",
          language: "ja",
          main: false,
          priority: 1,
          isAcronym: false,
        },
        {
          title: "One Punch-Man",
          language: "en",
          main: false,
          priority: 2,
          isAcronym: false,
        },
        {
          title: "OPM",
          language: "en",
          main: false,
          priority: 3,
          isAcronym: true,
        },
      ],
    })
    .refine((data) => data.filter((item) => item.main).length === 1, {
      message: "Exactly one title must be the main title.",
    }),
  covers: z
    .object({
      file: fileSchema("The file of the cover."),
      language: languageSchema("The language of the cover."),
      contentRating: contentRatingSchema("The content rating of the cover."),
      main: z.boolean().default(false).optional().meta({
        description: "Whether the cover is the main cover of the media.",
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
      description:
        "The covers of the media. At least one cover is required and exactly one main cover is required.",
      examples: [
        {
          file: "cover-1.jpg",
          language: "en",
          contentRating: "NORMAL",
          main: true,
          volume: 1,
        },
        {
          file: "cover-3.jpg",
          language: "ja",
          contentRating: "NORMAL",
          main: false,
          volume: 1,
        },
        {
          file: "cover-2.jpg",
          language: "en",
          contentRating: "SUGGESTIVE",
          main: false,
          volume: 2,
        },
      ],
    }),
  banners: z
    .object({
      file: fileSchema("The file of the banner."),
      contentRating: contentRatingSchema("The content rating of the banner."),
    })
    .array()
    .default([])
    .optional()
    .meta({
      description: "The banners of the media.",
      examples: [
        { file: "banner-1.jpg", contentRating: "NORMAL" },
        { file: "banner-2.jpg", contentRating: "SUGGESTIVE" },
      ],
    }),
  oneShot: z.boolean().default(false).meta({
    description: "Whether the media is a one-shot.",
    example: false,
  }),
  contentRating: contentRatingSchema("The content rating of the media."),
  type: z.enum(MediaType).meta({ description: "The type of the media." }),
  status: z.enum(MediaStatus).meta({
    description: "The current release status of the media.",
    example: "RELEASING",
  }),
  source: z.enum(MediaSource).meta({
    description: "The original source of the media.",
    example: "ORIGINAL",
  }),
  demography: z.enum(MediaDemography).meta({
    description: "The target audience of the media.",
    example: "SHOUNEN",
  }),
  countryOfOrigin: z.enum(MediaCountryOfOrigin).meta({
    description: "The country where the media was originally created.",
    example: "JAPAN",
  }),
  genres: z
    .array(z.enum(MediaGenres))
    .default([])
    .optional()
    .meta({
      description: "The genres of the media.",
      example: ["ACTION", "COMEDY", "SUPERNATURAL"],
    }),
  tags: z
    .object({
      name: z
        .enum(Object.keys(config.tags))
        .meta({ description: "The name of the tag.", example: "Cowboys" }),
      isSpoiler: z
        .boolean()
        .default(false)
        .meta({ description: "Whether the tag is a spoiler.", example: false }),
    })
    .array()
    .default([])
    .optional()
    .meta({
      description:
        "List of tags that describe elements and themes of the media.",
      examples: [
        { name: "Cowboys", isSpoiler: false },
        { name: "Table Tennis", isSpoiler: false },
      ],
    }),
})

export const mediasRouter = new Hono().post(
  "/",
  describeRoute({
    summary: "Create a new media",
    tags: ["Media"],
    requestBody: {
      content: {
        "multipart/form-data":
          await resolver(createMediaSchema).toOpenAPISchema(),
      },
    },
    responses: {
      201: {
        description: "Media created successfully",
        content: {
          "application/json": {
            schema: resolver(createMediaSchema),
          },
        },
      },
    },
  }),
  validateFormData(createMediaSchema),
  checkImages(),
  async (c) => {
    const body = c.get("formData")

    console.log("Creating a new media", body)

    // TODO: Implement media creation logic
    const media = { id: "placeholder", ...body }

    return c.ok(media)
  },
)
