"use server"

import { cookies } from "next/headers"
import { I18N_COOKIE_NAME, I18N_LANGUAGES } from "~/utils/parse-locale"

export const setLocale = async (input: string) => {
  const cookieStore = await cookies()

  if (!I18N_LANGUAGES.includes(input)) {
    return
  }

  cookieStore.set(I18N_COOKIE_NAME, input)
}
