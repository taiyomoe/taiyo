import { useEffect, useSyncExternalStore } from "react"
import {
  downloadOfflineChapter,
  isOfflineSupported,
  type OfflineChapter,
  type OfflineChapterSource,
  readOfflineChapters,
  deleteOfflineChapters,
  registerOfflineWorker,
  removeOfflineChapter,
} from "@/features/offline/lib/offline-chapters"

type Download = { done: number; total: number; controller: AbortController }

type OfflineState = {
  chapters: readonly OfflineChapter[] | null
  downloads: ReadonlyMap<string, Download>
  failed: ReadonlySet<string>
}

const SERVER_STATE: OfflineState = { chapters: null, downloads: new Map(), failed: new Set() }
const listeners = new Set<() => void>()
let state = SERVER_STATE
let loading: Promise<void> | null = null
const setState = (patch: Partial<OfflineState>) => {
  state = { ...state, ...patch }

  for (const listener of listeners) {
    listener()
  }
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
const load = () => {
  loading ??= readOfflineChapters()
    .then(async (chapters) => {
      setState({ chapters })

      if (chapters.length > 0) {
        await registerOfflineWorker()
      }
    })
    .catch(() => {
      setState({ chapters: [] })
    })

  return loading
}

export const clearOfflineChapters = async () => {
  for (const { controller } of state.downloads.values()) {
    controller.abort()
  }

  if (isOfflineSupported()) {
    await deleteOfflineChapters()
  }

  loading = null
  setState({
    chapters: state.chapters === null ? null : [],
    downloads: new Map(),
    failed: new Set(),
  })
}

export function useOfflineChapters() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  )

  useEffect(() => {
    if (isOfflineSupported()) {
      void load()
    }
  }, [])

  return {
    supported: snapshot.chapters !== null,
    chapters: snapshot.chapters ?? [],
    downloads: snapshot.downloads,
    failed: snapshot.failed,
    download: (source: OfflineChapterSource) => {
      if (state.downloads.has(source.id)) {
        return
      }

      const controller = new AbortController()
      const failed = new Set(state.failed)
      const track = (done: number) => {
        setState({
          downloads: new Map(state.downloads).set(source.id, {
            done,
            total: source.pageUrls.length,
            controller,
          }),
        })
      }
      const finish = (patch: Partial<OfflineState>) => {
        const downloads = new Map(state.downloads)

        downloads.delete(source.id)
        setState({ ...patch, downloads })
      }

      failed.delete(source.id)
      setState({ failed })
      track(0)
      downloadOfflineChapter(source, { signal: controller.signal, onProgress: track }).then(
        (chapters) => {
          finish({ chapters })
        },
        () => {
          finish({
            failed: controller.signal.aborted ? state.failed : new Set(state.failed).add(source.id),
          })
        },
      )
    },
    cancel: (chapterId: string) => {
      state.downloads.get(chapterId)?.controller.abort()
    },
    remove: async (chapterId: string) => {
      setState({ chapters: await removeOfflineChapter(chapterId) })
    },
  }
}
