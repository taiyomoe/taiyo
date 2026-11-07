import z from "zod"

const fraction = z.number().min(0).max(1)

export const imageCropSchema = z
  .object({
    x: fraction.meta({ description: "Left edge, as a fraction of the transformed image width." }),
    y: fraction.meta({ description: "Top edge, as a fraction of the transformed image height." }),
    width: fraction.gt(0).meta({ description: "Width, as a fraction of the image width." }),
    height: fraction.gt(0).meta({ description: "Height, as a fraction of the image height." }),
    rotation: z.number().min(-180).max(180).default(0).meta({
      description:
        "Clockwise rotation in degrees, applied after flipping. The crop is measured on the bounding box of the rotated image. Animated GIFs only accept 0.",
    }),
    flipX: z.boolean().default(false).meta({ description: "Mirror horizontally first." }),
    flipY: z.boolean().default(false).meta({ description: "Mirror vertically first." }),
  })
  .refine((crop) => crop.x + crop.width <= 1.0001 && crop.y + crop.height <= 1.0001, {
    message: "The crop area must stay inside the image.",
  })

export type ImageCrop = z.infer<typeof imageCropSchema>

export const PROFILE_IMAGE_SIZES = {
  avatar: { width: 512, height: 512 },
  banner: { width: 1800, height: 600 },
} as const
