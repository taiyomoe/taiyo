import { pick } from "accept-language-parser"
import { z } from "zod"

export const I18N_LANGUAGES = ["en", "fr", "pt"] as const
export const I18N_COOKIE_NAME = "Language"
export const I18N_DEFAULT_LANGUAGE = "en"

export const parseLocale = (cookie: string | null, header: string | null) => {
  const parsedHeaderLocale = pick([...I18N_LANGUAGES], header ?? [], {
    loose: true,
  })

  return (
    [cookie, parsedHeaderLocale]
      .map((l) => z.enum(I18N_LANGUAGES).safeParse(l))
      .map((r) => (r.success ? r.data : null))
      .filter(Boolean)
      .at(0) ?? I18N_DEFAULT_LANGUAGE
  )
}
