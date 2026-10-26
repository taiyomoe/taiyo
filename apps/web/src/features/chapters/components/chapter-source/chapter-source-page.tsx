import * as stylex from "@stylexjs/stylex"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AppShell } from "@/components/shell/app-shell"
import { ChapterSource } from "@/features/chapters/components/chapter-source/chapter-source"

const routeApi = getRouteApi("/chapters/$chapterId/source")
const styles = stylex.create({
  root: {
    paddingBlock: { default: "2rem", "@media (width >= 48rem)": "4rem" },
    paddingInline: "1rem",
    display: "flex",
    justifyContent: "center",
  },
})

export function ChapterSourcePage() {
  const { session } = routeApi.useRouteContext()
  const { chapterId } = routeApi.useParams()

  return (
    <AppShell user={session?.user ?? null}>
      <div sx={styles.root}>
        <Suspense>
          <ChapterSource chapterId={chapterId} />
        </Suspense>
      </div>
    </AppShell>
  )
}
