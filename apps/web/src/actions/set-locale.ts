"use server"

import { cookies } from "next/headers"
import { siteConfig } from "~/site-config"

export const setLocale = async (input: string) => {
  const cookieStore = await cookies()

  if (!siteConfig.i18n.availableLocales.includes(input)) {
    return
  }

  cookieStore.set(siteConfig.i18n.cookie.name, input, {
    maxAge: siteConfig.i18n.cookie.maxAge,
  })
}
