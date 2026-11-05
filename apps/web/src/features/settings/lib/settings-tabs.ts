export const SETTINGS_TABS = [
  "profile",
  "account",
  "security",
  "preferences",
  "reader",
  "privacy",
] as const

export type SettingsTab = (typeof SETTINGS_TABS)[number]
