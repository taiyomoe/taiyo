import { z } from "zod"

// MangaDex serialises an empty object as `[]`.
const emptyAsObject = (value: unknown) => (Array.isArray(value) && value.length === 0 ? {} : value)
const localizedSchema = z.preprocess(
  emptyAsObject,
  z.record(z.string(), z.string().nullable()).nullable(),
)
const relationshipSchema = z.object({
  id: z.string(),
  type: z.string(),
  attributes: z.unknown().optional(),
})

export const staffAttributesSchema = z.object({
  name: z.string(),
  biography: localizedSchema,
  website: z.string().nullish(),
  twitter: z.string().nullish(),
  youtube: z.string().nullish(),
  tumblr: z.string().nullish(),
  fanBox: z.string().nullish(),
  fantia: z.string().nullish(),
  pixiv: z.string().nullish(),
  melonBook: z.string().nullish(),
  namicomi: z.string().nullish(),
  naver: z.string().nullish(),
  nicoVideo: z.string().nullish(),
  skeb: z.string().nullish(),
  weibo: z.string().nullish(),
  booth: z.string().nullish(),
})

export const groupAttributesSchema = z.object({
  name: z.string(),
  website: z.string().nullish(),
  discord: z.string().nullish(),
  contactEmail: z.string().nullish(),
  twitter: z.string().nullish(),
  description: z.string().nullish(),
})

export const mangaResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    attributes: z.object({
      title: localizedSchema,
      altTitles: z.array(localizedSchema).nullable(),
      description: localizedSchema,
      links: localizedSchema,
      originalLanguage: z.string(),
      publicationDemographic: z.string().nullable(),
      status: z.string(),
      year: z.number().int().nullable(),
      contentRating: z.string(),
      tags: z.array(
        z.object({
          id: z.string(),
          attributes: z.object({ name: localizedSchema, group: z.string() }),
        }),
      ),
    }),
    relationships: z.array(relationshipSchema),
  }),
})

const coverSchema = z.object({
  id: z.string(),
  attributes: z.object({
    volume: z.string().nullable(),
    fileName: z.string(),
    locale: z.string().nullable(),
  }),
  relationships: z.array(relationshipSchema),
})
const chapterSchema = z.object({
  id: z.string(),
  attributes: z.object({
    volume: z.string().nullable(),
    chapter: z.string().nullable(),
    title: z.string().nullable(),
    translatedLanguage: z.string(),
    externalUrl: z.string().nullable(),
    isUnavailable: z.boolean().optional(),
    publishAt: z.string(),
    readableAt: z.string().nullish(),
    pages: z.number().int(),
  }),
  relationships: z.array(relationshipSchema),
})
const collectionSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    data: z.array(item),
    limit: z.number().int(),
    offset: z.number().int(),
    total: z.number().int(),
  })

export const coversResponseSchema = collectionSchema(coverSchema)

export const chaptersResponseSchema = collectionSchema(chapterSchema)

export const atHomeResponseSchema = z.object({
  baseUrl: z.string(),
  chapter: z.object({ hash: z.string(), data: z.array(z.string()) }),
})
