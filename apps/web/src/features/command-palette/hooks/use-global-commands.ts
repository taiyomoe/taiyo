import { authClient } from "@taiyomoe/auth/client"
import { CONTENT_RATINGS } from "@taiyomoe/db/constants"
import {
  Book,
  Clock,
  Code,
  Home,
  LegalDocument,
  Link,
  Login,
  Logout,
  Monitor,
  Moon,
  Settings,
  Shuffle,
  Sparkles,
  Sun,
  User,
  UserAdd,
  Users,
  Eye,
  Shield,
} from "@taiyomoe/ui/components/icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import { use } from "react"
import type { PaletteCommand } from "@/features/command-palette/lib/palette-command"
import { env } from "@/env/client"
import { useRandomTitle } from "@/features/advanced-search/hooks/use-random-title"
import { DEFAULT_ADVANCED_SEARCH } from "@/features/advanced-search/lib/advanced-search"
import { DASHBOARD_SECTIONS } from "@/features/dashboard/lib/dashboard-sections"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import { unwrapAuth } from "@/features/users/api/user-admin"
import { useAuthActions } from "@/hooks/use-auth-actions"
import { useCurrentHref } from "@/hooks/use-current-href"
import { usePermissions } from "@/lib/permissions"
import { sessionQueryOptions } from "@/lib/session"
import { useSettings, useUpdateSettings } from "@/lib/settings"
import { ThemeContext } from "@/lib/theme"
import { m } from "@/paraglide/messages"

const DASHBOARD_EXTRAS: Partial<Record<string, { label?: () => string; keywords: string[] }>> = {
  "/dashboard": { keywords: ["dashboard", "overview", "stats", "home"] },
  "/dashboard/upload": {
    label: m.palette_upload_chapter,
    keywords: ["upload", "chapter", "new", "submit", "publish", "add"],
  },
  "/dashboard/submissions": { keywords: ["my uploads", "submitted", "pending", "chapters"] },
  "/dashboard/chapter-reviews": { keywords: ["review", "approve", "queue", "chapters"] },
  "/dashboard/groups": { keywords: ["my groups", "teams", "manage"] },
  "/dashboard/invitations": { keywords: ["group invites", "invitations", "join"] },
  "/dashboard/group-requests": { keywords: ["ownership", "claims", "group creation"] },
  "/dashboard/my-suggestions": { keywords: ["my edits", "suggestions"] },
  "/dashboard/suggestions": { keywords: ["review edits", "suggestions", "queue"] },
  "/dashboard/users": { keywords: ["members", "accounts", "ban", "roles", "moderation"] },
}
const THEMES = [
  { value: "light", label: m.palette_theme_light, icon: Sun, keywords: ["bright", "day"] },
  { value: "dark", label: m.palette_theme_dark, icon: Moon, keywords: ["night", "black"] },
  { value: "system", label: m.palette_theme_system, icon: Monitor, keywords: ["auto", "os"] },
] as const

export function useGlobalCommands() {
  const href = useCurrentHref()
  const theme = use(ThemeContext)
  const { data: session } = useQuery({ ...sessionQueryOptions, staleTime: "static" })
  const user = session?.user ?? null
  const can = usePermissions(user)
  const auth = useAuthActions()
  const { contentRatings } = useSettings()
  const updateSettings = useUpdateSettings()
  const stopImpersonating = useMutation({
    mutationFn: () => unwrapAuth(authClient.admin.stopImpersonating()),
    onSuccess: () => {
      window.location.assign("/dashboard/users")
    },
  })
  const randomTitle = useRandomTitle()
  const navigation: PaletteCommand[] = [
    {
      id: "nav.home",
      label: m.shell_nav_home(),
      section: "navigate",
      icon: Home,
      keywords: ["start", "front page", "featured"],
      run: { type: "navigate", to: { to: "/" } },
    },
    {
      id: "nav.latest",
      label: m.palette_nav_latest(),
      section: "navigate",
      icon: Clock,
      keywords: ["new", "recent", "releases", "chapters", "updates"],
      run: { type: "navigate", to: { to: "/latest" } },
    },
    {
      id: "nav.recently-added",
      label: m.shell_nav_recently_added(),
      section: "navigate",
      icon: Sparkles,
      keywords: ["new", "recent", "titles", "series", "added", "fresh"],
      run: { type: "navigate", to: { to: "/recently-added" } },
    },
    {
      id: "nav.titles",
      label: m.palette_nav_titles(),
      section: "navigate",
      icon: Book,
      keywords: ["manga", "manhwa", "catalog", "all", "browse"],
      run: { type: "navigate", to: { to: "/titles" } },
    },
    {
      id: "nav.groups",
      label: m.palette_nav_groups(),
      section: "navigate",
      icon: Users,
      keywords: ["scanlation", "scans", "teams", "translators", "browse"],
      run: { type: "navigate", to: { to: "/groups" } },
    },
    {
      id: "nav.random",
      label: m.shell_nav_random_title(),
      section: "navigate",
      icon: Shuffle,
      keywords: ["surprise", "discover", "lucky"],
      run: {
        type: "perform",
        perform: () => {
          randomTitle.mutate(DEFAULT_ADVANCED_SEARCH)
        },
      },
    },
    ...(user === null
      ? []
      : [
          {
            id: "nav.profile",
            label: m.palette_nav_profile(),
            section: "navigate",
            icon: User,
            keywords: ["me", "account", "profile", user.username ?? ""],
            run: {
              type: "navigate",
              to: { to: "/users/$username", params: { username: user.username ?? "" } },
            },
          } satisfies PaletteCommand,
          {
            id: "nav.settings",
            label: m.palette_nav_settings(),
            section: "navigate",
            icon: Settings,
            keywords: [
              "account",
              "password",
              "email",
              "security",
              "two-factor",
              "2fa",
              "bio",
              "privacy",
              "preferences",
            ],
            run: { type: "navigate", to: { to: "/settings" } },
          } satisfies PaletteCommand,
        ]),
  ]
  const dashboard: PaletteCommand[] =
    user === null
      ? []
      : DASHBOARD_SECTIONS.flatMap((section) =>
          section.items.flatMap((item) => {
            if (item.to === undefined || !item.visible(can)) {
              return []
            }

            const extras = DASHBOARD_EXTRAS[item.to]
            const create = item.to === "/dashboard/upload"

            return [
              {
                id: `dashboard.${item.to}`,
                label: (extras?.label ?? item.label)(),
                section: create ? "create" : "dashboard",
                icon: item.icon,
                keywords: [...(extras?.keywords ?? []), "dashboard"],
                ...(create ? {} : { hint: m.dashboard_name() }),
                run: { type: "navigate", to: { to: item.to } },
              } satisfies PaletteCommand,
            ]
          }),
        )
  const preferences: PaletteCommand[] = [
    ...THEMES.map(({ value, label, icon, keywords }): PaletteCommand => ({
      id: `theme.${value}`,
      label: label(),
      section: "preferences",
      icon,
      keywords: ["theme", "appearance", "mode", "color", ...keywords],
      checked: theme.preference === value,
      run: {
        type: "perform",
        perform: () => {
          theme.setPreference(value)
        },
      },
    })),
    ...(user === null
      ? []
      : CONTENT_RATINGS.flatMap((rating): PaletteCommand[] => {
          const shown = contentRatings.includes(rating)

          if (shown && contentRatings.length === 1) {
            return []
          }

          const label = CONTENT_RATING_LABELS[rating]()

          return [
            {
              id: `content.${rating}`,
              label: shown
                ? m.palette_content_hide({ rating: label })
                : m.palette_content_show({ rating: label }),
              section: "preferences",
              icon: Eye,
              keywords: ["content", "filter", "rating", "mature", "adult", "nsfw"],
              run: {
                type: "perform",
                perform: () =>
                  updateSettings.mutateAsync({
                    contentRating: CONTENT_RATINGS.filter((candidate) =>
                      candidate === rating ? !shown : contentRatings.includes(candidate),
                    ),
                  }),
              },
            },
          ]
        })),
  ]
  const account: PaletteCommand[] =
    user === null
      ? [
          {
            id: "account.sign-in",
            label: m.auth_sign_in(),
            section: "account",
            icon: Login,
            keywords: ["log in", "login", "account"],
            run: { type: "navigate", to: { to: "/auth/sign-in", search: { redirect: href } } },
          },
          {
            id: "account.sign-up",
            label: m.palette_sign_up(),
            section: "account",
            icon: UserAdd,
            keywords: ["register", "create account", "join"],
            run: { type: "navigate", to: { to: "/auth/sign-up", search: { redirect: href } } },
          },
        ]
      : [
          ...(typeof session?.session.impersonatedBy === "string"
            ? [
                {
                  id: "account.stop-impersonating",
                  label: m.impersonation_stop(),
                  section: "account",
                  icon: Shield,
                  keywords: ["impersonate", "admin", "back"],
                  run: { type: "perform", perform: () => stopImpersonating.mutateAsync() },
                } satisfies PaletteCommand,
              ]
            : []),
          {
            id: "account.sign-out",
            label: m.palette_sign_out(),
            section: "account",
            icon: Logout,
            keywords: ["log out", "logout", "leave"],
            run: { type: "perform", perform: () => auth.signOut() },
          },
        ]
  const help: PaletteCommand[] = [
    {
      id: "help.copy-link",
      label: m.palette_copy_page_link(),
      section: "help",
      icon: Link,
      keywords: ["copy", "url", "share", "current"],
      run: { type: "copy", text: () => window.location.href },
    },
    {
      id: "help.api-docs",
      label: m.palette_api_docs(),
      section: "help",
      icon: Code,
      keywords: ["api", "developers", "openapi", "reference"],
      run: { type: "external", href: `${env.VITE_API_URL}/docs` },
    },
    {
      id: "help.terms",
      label: m.palette_terms(),
      section: "help",
      icon: LegalDocument,
      keywords: ["legal", "tos", "conditions"],
      run: { type: "navigate", to: { to: "/terms" } },
    },
    {
      id: "help.privacy",
      label: m.palette_privacy(),
      section: "help",
      icon: LegalDocument,
      keywords: ["legal", "data", "gdpr", "cookies"],
      run: { type: "navigate", to: { to: "/privacy" } },
    },
    {
      id: "help.dmca",
      label: m.palette_dmca(),
      section: "help",
      icon: LegalDocument,
      keywords: ["legal", "copyright", "takedown"],
      run: { type: "navigate", to: { to: "/dmca" } },
    },
  ]

  return [...navigation, ...dashboard, ...preferences, ...account, ...help]
}
