import * as stylex from "@stylexjs/stylex"
import { Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { layout } from "@/components/layout/layout.stylex"
import { AppShell } from "@/components/shell/app-shell"
import {
  MyListsSection,
  MyListsSkeleton,
} from "@/features/lists/components/lists-page/my-lists-section"
import {
  TopListsSection,
  TopListsSkeleton,
} from "@/features/lists/components/lists-page/top-lists-section"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/lists/")
const styles = stylex.create({
  page: {
    gap: "2.5rem",
    marginInline: "auto",
    paddingBlock: "2rem",
    paddingInline: layout.gutter,
    display: "flex",
    flexDirection: "column",
    maxWidth: "72rem",
    width: "100%",
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
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
  },
})

export function ListsPage() {
  const { session } = routeApi.useRouteContext()
  const { page } = routeApi.useLoaderDeps()
  const user = session?.user ?? null

  return (
    <AppShell user={user}>
      <div sx={styles.page}>
        <div sx={styles.header}>
          <div sx={styles.intro}>
            <h1 sx={styles.heading}>{m.lists_title()}</h1>
            <p sx={styles.subtitle}>{m.lists_subtitle()}</p>
          </div>
          {user === null ? null : (
            <Button render={<Link to="/lists/new" />}>
              <Plus />
              {m.lists_new()}
            </Button>
          )}
        </div>
        {user === null ? null : (
          <Suspense fallback={<MyListsSkeleton />}>
            <MyListsSection username={user.username} />
          </Suspense>
        )}
        <Suspense fallback={<TopListsSkeleton />}>
          <TopListsSection page={page} viewerId={user?.id ?? null} />
        </Suspense>
      </div>
    </AppShell>
  )
}
