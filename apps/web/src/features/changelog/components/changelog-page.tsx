import * as stylex from "@stylexjs/stylex"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi } from "@tanstack/react-router"
import { pageFrame } from "@/components/layout/page-frame"
import { AppShell } from "@/components/shell/app-shell"
import { ChangelogEntry } from "@/features/changelog/components/changelog-entry"
import { CHANGELOG_ENTRIES } from "@/features/changelog/content/entries"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/changelog")
const styles = stylex.create({
  page: {
    paddingBottom: "3rem",
    paddingTop: { default: "2rem", [breakpoints.md]: "4rem" },
  },
  header: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    marginBottom: { default: "2.5rem", [breakpoints.md]: "4rem" },
    paddingBottom: { default: "2rem", [breakpoints.md]: "3rem" },
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: { default: "2.25rem", [breakpoints.md]: "3rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  entries: {
    containerType: "inline-size",
  },
})

export function ChangelogPage() {
  const { session } = routeApi.useRouteContext()

  return (
    <AppShell user={session?.user ?? null}>
      <div sx={[pageFrame.frame, styles.page]}>
        <header sx={styles.header}>
          <h1 sx={styles.heading}>{m.changelog_title()}</h1>
          <p sx={styles.subtitle}>{m.changelog_subtitle()}</p>
        </header>
        <div sx={styles.entries}>
          {CHANGELOG_ENTRIES.map((entry, index) => (
            <ChangelogEntry
              entry={entry}
              key={entry.id}
              last={index === CHANGELOG_ENTRIES.length - 1}
              latest={index === 0}
            />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
