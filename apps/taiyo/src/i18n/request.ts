import { I18N_COOKIE_NAME } from "@taiyomoe/constants"
import { LanguageUtils } from "@taiyomoe/utils"
import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookie = cookieStore.get(I18N_COOKIE_NAME)?.value
  const header = headerStore.get("Accept-Language")
  const locale = LanguageUtils.parseReq(cookie, header)

  return {
    locale,
    messages: (await import(`../../../../packages/messages/src/${locale}.json`))
      .default,
  }
})
