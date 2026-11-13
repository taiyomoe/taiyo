import { useEffect, useState } from "react"
import {
  type RecommendationEvent,
  recordRecommendationEvent,
} from "@/features/recommendations/api/recommendations"

const FLUSH_DELAY_MS = 1000

export function useRecommendationTracking({
  surface,
  sourceMediaId,
  mediaIds,
}: {
  surface: RecommendationEvent["surface"]
  sourceMediaId: string | null
  mediaIds: readonly string[]
}) {
  const [element, setElement] = useState<HTMLUListElement | null>(null)
  const shown = mediaIds.join(",")

  useEffect(() => {
    if (element === null || shown === "" || typeof IntersectionObserver === "undefined") {
      return undefined
    }

    const ids = shown.split(",")
    const items = [...element.children]
    const seen = new Set<string>()
    const pending = new Set<string>()
    let timer: ReturnType<typeof setTimeout> | undefined
    const flush = () => {
      timer = undefined

      if (pending.size > 0) {
        recordRecommendationEvent({
          kind: "IMPRESSION",
          surface,
          sourceMediaId,
          mediaIds: ids.filter((id) => pending.has(id)),
        })
        pending.clear()
      }
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = ids[items.indexOf(entry.target)]

          if (entry.isIntersecting && id !== undefined && !seen.has(id)) {
            seen.add(id)
            pending.add(id)
          }
        }

        if (pending.size > 0 && timer === undefined) {
          timer = setTimeout(flush, FLUSH_DELAY_MS)
        }
      },
      { threshold: 0.5 },
    )

    for (const item of items) {
      observer.observe(item)
    }

    return () => {
      observer.disconnect()
      clearTimeout(timer)
      flush()
    }
  }, [element, shown, surface, sourceMediaId])

  return {
    observe: setElement,
    onOpen: (mediaId: string, position: number) => {
      recordRecommendationEvent({ kind: "CLICK", surface, sourceMediaId, mediaId, position })
    },
  }
}
