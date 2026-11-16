import * as stylex from "@stylexjs/stylex"
import { ArrowLeft } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { CatchBoundary, getRouteApi, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { pageFrame } from "@/components/layout/page-frame"
import { AppShell } from "@/components/shell/app-shell"
import { ListContent } from "@/features/lists/components/list-page/list-content"
import { ListError } from "@/features/lists/components/list-page/list-error"
import { ListHeaderSkeleton } from "@/features/lists/components/list-page/list-header"
import { ListItemsSkeleton } from "@/features/lists/components/list-page/list-items"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/lists/$listId")
const styles = stylex.create({
  page: {
    gap: "2rem",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "2.5rem",
    paddingTop: "1.5rem",
  },
  back: {
    alignSelf: "flex-start",
    marginInlineStart: "-0.5rem",
  },
})

export function ListPage() {
  const { session } = routeApi.useRouteContext()
  const { listId } = routeApi.useParams()
  const user = session?.user ?? null

  return (
    <AppShell user={user}>
      <div sx={[pageFrame.frame, styles.page]}>
        <Button render={<Link to="/lists" />} size="sm" sx={styles.back} variant="ghost">
          <ArrowLeft />
          {m.list_back()}
        </Button>
        <CatchBoundary errorComponent={ListError} getResetKey={() => listId}>
          <Suspense
            fallback={
              <>
                <ListHeaderSkeleton />
                <ListItemsSkeleton />
              </>
            }
          >
            <ListContent listId={listId} viewerId={user?.id ?? null} />
          </Suspense>
        </CatchBoundary>
      </div>
    </AppShell>
  )
}
