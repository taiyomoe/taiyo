import { MediaTitleSchema } from "~/lib/schemas/prisma";

const hasMinimumLength = (t: { title: string }[]) =>
  t.every((x) => x.title.length > 0);
const isEachTitleUnique = (t: { title: string; language: string }[]) =>
  new Set<string>([...t.map((x) => `${x.language}-${x.title}`)]).size ===
  t.length;
const hasOnlyOneMainTitle = (t: { isMainTitle: boolean }[]) =>
  t.filter((x) => x.isMainTitle).length === 1;

export const insertMediaTitleSchema = MediaTitleSchema.pick({
  title: true,
  language: true,
  priority: true,
  isAcronym: true,
  isMainTitle: true,
})
  .array()
  .min(1)
  .refine(hasMinimumLength, "Must be > 0")
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
  .array()
  .min(1)
  .refine(hasMinimumLength, "Must be > 0")
  .refine(isEachTitleUnique, "Must be unique")
  .refine(hasOnlyOneMainTitle, "Must have one and only one main title");
