import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

import { sessionQueryOptions } from "@/lib/queries/session"
import { getSidebarPrefs } from "@/lib/sidebar-prefs"
import {
  ThemeContext,
  darkThemeClassName,
  getThemePreference,
  systemThemeScript,
  useThemeState,
} from "@/lib/theme"

import appCss from "../styles.css?url"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ context }) => ({
    session: await context.queryClient.ensureQueryData(sessionQueryOptions),
    sidebarPrefs: getSidebarPrefs(),
    themePreference: getThemePreference(),
  }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Taiyō" },
      { name: "description", content: "Read, track, and organize the manga you love." },
      { name: "apple-mobile-web-app-title", content: "Taiyō" },
      { name: "theme-color", content: "#120a07" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      ...(import.meta.env.DEV ? [{ rel: "stylesheet", href: "/virtual:stylex.css" }] : []),
      { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: import.meta.env.DEV ? [{ type: "module", src: "/@id/virtual:stylex:runtime" }] : [],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { themePreference } = Route.useRouteContext()
  const theme = useThemeState(themePreference)

  return (
    <html
      className={theme.dark ? darkThemeClassName : undefined}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {theme.preference === "system" ? (
          <script dangerouslySetInnerHTML={{ __html: systemThemeScript }} />
        ) : null}
        <HeadContent />
      </head>
      <body>
        <ThemeContext value={theme}>{children}</ThemeContext>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
            { name: "Tanstack Query", render: <ReactQueryDevtoolsPanel /> },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
