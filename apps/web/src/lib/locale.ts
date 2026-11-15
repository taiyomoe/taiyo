import { type Locale, getLocale } from "@/paraglide/runtime"

const CONTENT_LANGUAGES = {
  en: "en",
  "pt-BR": "pt_br",
  fr: "fr",
} as const satisfies Record<Locale, string>

export type ContentLanguage = (typeof CONTENT_LANGUAGES)[Locale]

export const getContentLanguage = () => CONTENT_LANGUAGES[getLocale()]

export const pickLocalized = (values: Partial<Record<string, string>>) =>
  values[getContentLanguage()] ??
  values.en ??
  Object.values(values).find((value) => value !== undefined && value !== "")

export const localizeTagName = (name: { en: string } & Partial<Record<string, string>>) =>
  name[getContentLanguage()] ?? name.en
