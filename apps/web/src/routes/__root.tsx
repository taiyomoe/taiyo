import * as stylex from "@stylexjs/stylex"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { darkShadows, darkTheme } from "@taiyomoe/ui/styles/tokens.stylex"

import appCss from "../styles.css?url"

// Dark is the design system's flagship theme. The `dark` class drives the
// Tailwind-side tokens (globals.css); the StyleX theme classes re-declare the
// StyleX token variables for the migrated components. Both live on <html> so
// portals inherit them.
const darkModeClassName = `dark ${stylex.props(darkTheme, darkShadows).className ?? ""}`.trim()

export const Route = createRootRoute({
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
      { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className={darkModeClassName} lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
