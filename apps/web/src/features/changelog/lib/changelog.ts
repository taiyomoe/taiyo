import type { Locale } from "@/paraglide/runtime"
import { m } from "@/paraglide/messages"

export const CHANGELOG_TAGS = {
  accounts: { label: m.changelog_tag_accounts, color: "violet" },
  comments: { label: m.changelog_tag_comments, color: "pink" },
  groups: { label: m.changelog_tag_groups, color: "emerald" },
  home: { label: m.changelog_tag_home, color: "amber" },
  lists: { label: m.changelog_tag_lists, color: "amber" },
  notifications: { label: m.changelog_tag_notifications, color: "brand" },
  offline: { label: m.changelog_tag_offline, color: "gray" },
  profiles: { label: m.changelog_tag_profiles, color: "violet" },
  reader: { label: m.changelog_tag_reader, color: "brand" },
  search: { label: m.changelog_tag_search, color: "emerald" },
  titles: { label: m.changelog_tag_titles, color: "pink" },
  uploads: { label: m.changelog_tag_uploads, color: "gray" },
} as const satisfies Record<string, { label: () => string; color: string }>

export type ChangelogTag = keyof typeof CHANGELOG_TAGS

type Localized<T = string> = Record<Locale, T>

export type ChangelogBlock = string | readonly string[] | { heading: string }

export type ChangelogSection = {
  title: Localized
  items: ReadonlyArray<{ tag: ChangelogTag; text: Localized }>
}

export type ChangelogEntry = {
  id: string
  date: string
  title: Localized
  image?: { src: Localized; width: number; height: number; alt: Localized }
  body: Localized<readonly ChangelogBlock[]>
  sections?: readonly ChangelogSection[]
}
