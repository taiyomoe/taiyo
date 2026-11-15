import z from "zod"

const fraction = z.number().min(0).max(1)

export const imageCropSchema = z
  .object({
    x: fraction.meta({
      description: "The left edge of the crop, as a fraction of the transformed image's width.",
      example: 0.1,
    }),
    y: fraction.meta({
      description: "The top edge of the crop, as a fraction of the transformed image's height.",
      example: 0.05,
    }),
    width: fraction.gt(0).meta({
      description: "The width of the crop, as a fraction of the transformed image's width.",
      example: 0.8,
    }),
    height: fraction.gt(0).meta({
      description: "The height of the crop, as a fraction of the transformed image's height.",
      example: 0.8,
    }),
    rotation: z.number().min(-180).max(180).default(0).meta({
      description:
        "The clockwise rotation in degrees, applied after flipping. The crop is measured on the bounding box of the rotated image. GIFs only accept 0.",
    }),
    flipX: z
      .boolean()
      .default(false)
      .meta({ description: "Whether to mirror the image horizontally before rotating it." }),
    flipY: z
      .boolean()
      .default(false)
      .meta({ description: "Whether to mirror the image vertically before rotating it." }),
  })
  .refine((crop) => crop.x + crop.width <= 1.0001 && crop.y + crop.height <= 1.0001, {
    message: "The crop area must stay inside the image.",
  })
  .meta({ description: "The area of the image to keep. It must stay inside the image." })

export type ImageCrop = z.infer<typeof imageCropSchema>

export const PROFILE_IMAGE_SIZES = {
  avatar: { width: 512, height: 512 },
  banner: { width: 1800, height: 600 },
} as const
