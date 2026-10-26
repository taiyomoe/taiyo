import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { sceneFont } from "@/components/scene/scene.stylex"
import { AppShell } from "@/components/shell/app-shell"
import { GroupsGrid } from "@/features/groups/components/groups/groups-grid"
import { GroupsGridSkeleton } from "@/features/groups/components/groups/groups-grid-skeleton"
import { GroupsSearch } from "@/features/groups/components/groups/groups-search"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/groups/")
const styles = stylex.create({
  page: {
    gap: "1.75rem",
    paddingBlock: "2rem",
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2rem" },
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "1.25rem",
    alignItems: "flex-end",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  intro: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", "@media (width >= 48rem)": "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
  },
  footer: {
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    textAlign: "center",
  },
  footerLink: {
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontWeight: 500,
  },
})

export function GroupsPage() {
  const { session } = routeApi.useRouteContext()
  const { q: search, page } = routeApi.useLoaderDeps()
  const user = session?.user ?? null

  return (
    <AppShell user={user}>
      <div sx={styles.page}>
        <div sx={styles.header}>
          <div sx={styles.intro}>
            <h1 sx={styles.heading}>{m.groups_title()}</h1>
            <p sx={styles.subtitle}>{m.groups_subtitle()}</p>
          </div>
          <GroupsSearch search={search} />
        </div>
        <Suspense fallback={<GroupsGridSkeleton />}>
          <GroupsGrid page={page} search={search} />
        </Suspense>
        <p sx={styles.footer}>
          {m.groups_request_cta()}{" "}
          <Link
            {...stylex.props(styles.footerLink)}
            to={user === null ? "/auth/sign-in" : "/dashboard/groups"}
          >
            {m.groups_request_link()}
          </Link>
        </p>
      </div>
    </AppShell>
  )
}
