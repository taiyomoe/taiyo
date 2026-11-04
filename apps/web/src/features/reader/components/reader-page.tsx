import { getRouteApi } from "@tanstack/react-router"
import { Suspense, useState } from "react"
import { ChapterReader } from "@/features/reader/components/chapter-reader"
import { ReaderSplash } from "@/features/reader/components/reader-splash"
import { useHydrated } from "@/features/reader/hooks/use-hydrated"

const routeApi = getRouteApi("/chapters/$chapterId/")

export function ReaderPage() {
  const { chapterId } = routeApi.useParams()
  const { page } = routeApi.useSearch()
  const { session: authSession } = routeApi.useRouteContext()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [session, setSession] = useState(() => ({
    key: 0,
    chapterId,
    chapters: new Set<string>(),
  }))
  const hydrated = useHydrated()

  if (session.chapterId !== chapterId) {
    const continued = session.chapters.has(chapterId)

    setSession({
      key: continued ? session.key : session.key + 1,
      chapterId,
      chapters: continued ? session.chapters : new Set(),
    })
  }

  if (!hydrated) {
    return <ReaderSplash />
  }

  return (
    <Suspense fallback={<ReaderSplash />}>
      <ChapterReader
        chapterId={chapterId}
        key={session.key}
        onSessionChapters={(chapters) => {
          setSession((previous) => ({ ...previous, chapters: new Set(chapters) }))
        }}
        onSheetOpenChange={setSheetOpen}
        requestedPage={page}
        sheetOpen={sheetOpen}
        signedIn={authSession !== null}
      />
    </Suspense>
  )
}
