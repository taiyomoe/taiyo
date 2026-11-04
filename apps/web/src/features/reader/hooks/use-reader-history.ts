import { noop, useQueryClient } from "@tanstack/react-query"
import { useEffect, useEffectEvent, useRef } from "react"
import type { ChapterReaderData } from "@/features/reader/api/reader"
import { api } from "@/lib/api"

const SAVE_DELAY = 1000

export function useReaderHistory({
  chapterId,
  mediaId,
  pageId,
  completed,
  enabled,
}: {
  chapterId: string
  mediaId: string
  pageId: string | null
  completed: boolean
  enabled: boolean
}) {
  const queryClient = useQueryClient()
  const opened = useRef<Promise<unknown> | null>(null)
  const saved = useRef<{ pageId: string | null; completed: boolean } | null>(null)
  const save = useEffectEvent((keepalive: boolean) => {
    const previous = saved.current
    const body = {
      pageId,
      ...(completed && previous?.completed !== true ? { completed: true } : {}),
    }

    if (opened.current !== null && (previous?.pageId !== pageId || body.completed !== undefined)) {
      saved.current = { pageId, completed: completed || previous?.completed === true }
      queryClient.setQueriesData<ChapterReaderData>(
        { queryKey: ["chapters", chapterId, "reader"] },
        (data) => (data === undefined ? data : { ...data, history: saved.current }),
      )
      void opened.current
        .then(() =>
          api.chapters[":id"].history.$patch(
            { param: { id: chapterId }, json: body },
            { init: { keepalive } },
          ),
        )
        .then(() => queryClient.invalidateQueries({ queryKey: ["progress", mediaId] }))
        .catch(noop)
    }
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    opened.current = api.chapters[":id"].open
      .$post({ param: { id: chapterId } })
      .then(async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["progress", mediaId] }),
          queryClient.invalidateQueries({ queryKey: ["medias", mediaId, "chapters"] }),
        ])
      })
      .catch(noop)
  }, [chapterId, enabled, mediaId, queryClient])

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const timeout = setTimeout(
      () => {
        save(false)
      },
      completed ? 0 : SAVE_DELAY,
    )

    return () => {
      clearTimeout(timeout)
    }
  }, [enabled, pageId, completed])

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const flush = () => {
      save(true)
    }

    window.addEventListener("pagehide", flush)

    return () => {
      window.removeEventListener("pagehide", flush)
      flush()
    }
  }, [enabled])
}
