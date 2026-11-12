import { config } from "@taiyomoe/config"
import { BookOpenText, Comment, ThumbsUp, UserAdd } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { type Session, sessionQueryOptions } from "@/lib/session"
import { useUpdateSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

type UserSettings = Session["user"]["settings"]
type BooleanSetting = {
  [Key in keyof typeof config.settings]: (typeof config.settings)[Key] extends boolean ? Key : never
}[keyof typeof config.settings]

/** The kinds of notification a user can turn off, in the order the inbox lists them. */
export const NOTIFY_SETTINGS = [
  {
    key: "notifyChapters",
    icon: BookOpenText,
    label: m.notifications_preference_chapters,
    hint: m.user_settings_notify_chapters_hint,
  },
  {
    key: "notifyReplies",
    icon: Comment,
    label: m.notifications_preference_replies,
    hint: m.user_settings_notify_replies_hint,
  },
  {
    key: "notifyLikes",
    icon: ThumbsUp,
    label: m.notifications_preference_upvotes,
    hint: m.user_settings_notify_upvotes_hint,
  },
  {
    key: "notifyFollows",
    icon: UserAdd,
    label: m.notifications_preference_follows,
    hint: m.user_settings_notify_follows_hint,
  },
] as const

/** Reads and changes the boolean settings, falling back on their defaults. */
export const useBooleanSettings = (fallback: UserSettings) => {
  const updateSettings = useUpdateSettings()
  const { data: session } = useQuery({ ...sessionQueryOptions, staleTime: "static" })
  const settings = session?.user.settings ?? fallback

  return {
    get: (key: BooleanSetting) => settings[key] ?? config.settings[key],
    set: (key: BooleanSetting, value: boolean) => {
      updateSettings.mutate({ [key]: value })
    },
  }
}
