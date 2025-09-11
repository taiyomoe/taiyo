import { config } from "@taiyomoe/config"
import { cookies } from "next/headers"
import { cache } from "react"
import { siteConfig } from "~/site-config"
import { getSession } from "~/utils/get-session"

export const getSettings = cache(
  async (): Promise<Required<PrismaJson.UserSettings>> => {
    const session = await getSession()

    if (session) {
      return {
        ...config.settings,
        ...session.user.settings,
      }
    }

    const cookieStore = await cookies()
    const settingsCookie = cookieStore.get(siteConfig.settings.cookie.name)

    if (!settingsCookie) {
      return config.settings
    }

    try {
      const parsed = JSON.parse(
        settingsCookie.value,
      ) as Required<PrismaJson.UserSettings>

      return {
        ...config.settings,
        ...parsed,
      }
    } catch {
      cookieStore.set(
        siteConfig.settings.cookie.name,
        JSON.stringify(config.settings),
      )

      return config.settings
    }
  },
)
