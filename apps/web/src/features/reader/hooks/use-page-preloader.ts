import { useEffect, useEffectEvent, useRef } from "react"

const CONCURRENCY = 1
const stop = (image: HTMLImageElement) => {
  image.onload = null
  image.onerror = null
  image.src = ""
}

export function usePagePreloader({
  urls,
  first,
  last,
  ahead,
  enabled,
  paused,
  onLoad,
}: {
  urls: readonly string[]
  first: number
  last: number
  ahead: number
  enabled: boolean
  paused: boolean
  onLoad: (index: number, aspect: number) => void
}) {
  const settled = useRef(new Set<number>())
  const inflight = useRef(new Map<number, HTMLImageElement>())
  const pump = useRef<() => void>(() => {})
  const handleLoad = useEffectEvent(onLoad)

  useEffect(() => {
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true
    const limit = saveData ? Math.min(ahead, 1) : ahead
    const count = enabled ? limit : 0
    const wanted = (
      count === 0
        ? []
        : [
            last + 1,
            first - 1,
            ...Array.from({ length: count - 1 }, (_, offset) => last + 2 + offset),
          ]
    ).filter((index) => index >= 0 && index < urls.length)

    for (const [index, image] of inflight.current) {
      if (!wanted.includes(index) && (index < first || index > last)) {
        stop(image)
        inflight.current.delete(index)
      }
    }

    pump.current = () => {
      if (paused) {
        return
      }

      const next = wanted.find(
        (index) => !settled.current.has(index) && !inflight.current.has(index),
      )

      if (next === undefined || inflight.current.size >= CONCURRENCY) {
        return
      }

      const image = new Image()
      const finish = () => {
        settled.current.add(next)
        inflight.current.delete(next)
        pump.current()
      }

      image.decoding = "async"
      image.fetchPriority = "low"
      image.onload = () => {
        handleLoad(next, image.naturalWidth / image.naturalHeight)
        finish()
      }
      image.onerror = finish
      inflight.current.set(next, image)
      image.src = urls[next] ?? ""
    }

    pump.current()
  }, [ahead, enabled, first, last, paused, urls])

  useEffect(() => {
    const images = inflight.current

    return () => {
      for (const image of images.values()) {
        stop(image)
      }

      images.clear()
    }
  }, [])
}
