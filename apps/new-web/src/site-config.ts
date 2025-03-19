export const siteConfig = {
  i18n: {
    availableLocales: ["en", "pt"],
    defaultLocale: "en",
    cookie: {
      name: "Language",
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  sidebar: {
    cookie: {
      name: "Sidebar",
      maxAge: 60 * 60 * 24 * 7,
    },
  },
} as const
