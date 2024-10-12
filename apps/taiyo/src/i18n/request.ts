import {
  I18N_COOKIE_NAME,
  I18N_DEFAULT_LANGUAGE,
  I18N_LANGUAGES,
} from "@taiyomoe/constants"
import { pick } from "accept-language-parser"
import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"
import { z } from "zod"

export default getRequestConfig(async () => {
  const rawCookie = cookies().get(I18N_COOKIE_NAME)?.value
  const header = headers().get("Accept-Language")
  const parsedHeaderLocale = pick([...I18N_LANGUAGES], header ?? [], {
    loose: true,
  })
  const locale =
    [rawCookie, parsedHeaderLocale]
      .map((l) => z.enum(I18N_LANGUAGES).safeParse(l))
      .map((r) => (r.success ? r.data : null))
      .filter(Boolean)
      .at(0) ?? I18N_DEFAULT_LANGUAGE

  return {
    locale,
    messages: (await import(`../../../../packages/messages/src/${locale}.json`))
      .default,
  }
})
