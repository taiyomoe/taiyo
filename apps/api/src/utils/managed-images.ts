import { paginationQuerySchema } from "@taiyomoe/schemas"
import z from "zod"
import { contentRatingSchema, userSummarySchema } from "./schemas"

export const managedImagesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(100).optional().meta({
    description: "Only list the images of the medias with a title containing this text.",
    example: "one punch",
  }),
  mediaId: z.uuid().optional().meta({
    description: "Only list the images of this media.",
    example: "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
  }),
  contentRating: contentRatingSchema("Only list the images with this content rating.").optional(),
})

export const managedImageSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the image." }),
  url: z.url().meta({ description: "The URL of the image." }),
  contentRating: contentRatingSchema("The content rating of the image."),
  createdAt: z.iso.datetime().meta({ description: "When the image was uploaded." }),
  media: z
    .object({
      id: z.uuid().meta({ description: "The ID of the media." }),
      title: z
        .string()
        .nullable()
        .meta({ description: "The main title of the media, if any.", example: "One Punch Man" }),
      imageCount: z.int().meta({
        description: "The number of images of the same kind the media has, this one included.",
        example: 3,
      }),
    })
    .meta({ description: "The media the image belongs to." }),
  uploader: userSummarySchema.meta({ description: "The user who uploaded the image." }),
})
