import { config } from "@taiyomoe/config"
import { type MediaType, USER_LIST_VISIBILITIES } from "@taiyomoe/db/constants"
import { z } from "zod"
import { m } from "@/paraglide/messages"

export type EditorTitle = {
  mediaId: string
  title: string | null
  coverUrl: string | null
  type: MediaType
}

export const listDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, m.list_editor_name_required())
    .max(config.input.maxNameLength, m.global_max_length({ count: config.input.maxNameLength })),
  description: z
    .string()
    .trim()
    .max(
      config.input.maxDescriptionLength,
      m.global_max_length({ count: config.input.maxDescriptionLength }),
    ),
  visibility: z.enum(USER_LIST_VISIBILITIES),
})

export type ListDetailsValues = z.infer<typeof listDetailsSchema>
