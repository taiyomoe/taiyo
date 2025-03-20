import { pick } from "accept-language-parser"
import { z } from "zod"
import { siteConfig } from "~/site-config"

export const parseLocale = (cookie: string | null, header: string | null) => {
  const parsedHeaderLocale = pick(
    [...siteConfig.i18n.availableLocales],
    header ?? [],
    { loose: true },
  )

  return (
    [cookie, parsedHeaderLocale]
      .map((l) => z.enum(siteConfig.i18n.availableLocales).safeParse(l))
      .map((r) => (r.success ? r.data : null))
      .filter(Boolean)
      .at(0) ?? siteConfig.i18n.defaultLocale
  )
}
