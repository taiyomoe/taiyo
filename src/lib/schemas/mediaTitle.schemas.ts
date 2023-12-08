import { MediaTitleSchema } from "~/lib/schemas/prisma";

const isEachTitleUnique = (t: { title: string; language: string }[]) =>
  new Set<string>([...t.map((x) => `${x.language}-${x.title}`)]).size ===
  t.length;
const hasOnlyOneMainTitle = (t: { isMainTitle: boolean }[]) =>
  t.filter((x) => x.isMainTitle).length === 1;

export const createMediaTitleSchema = MediaTitleSchema.pick({
  title: true,
  language: true,
  priority: true,
  isAcronym: true,
  isMainTitle: true,
}).refine((t) => t.title.length > 0, "Must be > 0");

export const createMediaTitlesSchema = createMediaTitleSchema
  .array()
  .min(1)
  .refine(isEachTitleUnique, "Must be unique")
  .refine(hasOnlyOneMainTitle, "Must have one and only one main title");

export const updateMediaTitleSchema = MediaTitleSchema.pick({
  id: true,
  title: true,
  language: true,
  priority: true,
  isAcronym: true,
  isMainTitle: true,
})
  .partial()
  .required({ id: true })
  .refine((t) => (t.title ? t.title.length > 0 : true), "Must be > 0");

export type CreateMediaTitleSchema = typeof createMediaTitleSchema._type;
export type CreateMediaTitlesSchema = typeof createMediaTitlesSchema._type;
export type UpdateMediaTitleSchema = typeof updateMediaTitleSchema._type;
