import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"
import { siteConfig } from "~/site-config"
import { parseLocale } from "~/utils/parse-locale"

export default getRequestConfig(async () => {
  const cookie =
    (await cookies()).get(siteConfig.i18n.cookie.name)?.value || null
  const header = (await headers()).get("Accept-Language")
  const locale = parseLocale(cookie, header)

  return {
    locale,
    messages: (await import(`../../../../packages/messages/src/${locale}.json`))
      .default,
  }
})
