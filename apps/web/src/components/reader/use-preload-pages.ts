import { useEffect, useRef } from "react"

import { getPreloadIndices } from "@/components/reader/preload"

export function usePreloadPages(urls: string[], current: number) {
  const requested = useRef(new Set<string>())

  useEffect(() => {
    for (const index of getPreloadIndices(current, urls.length)) {
      const url = urls[index]

      if (url && !requested.current.has(url)) {
        requested.current.add(url)

        const image = new Image()

        image.decoding = "async"
        image.src = url
      }
    }
  }, [urls, current])
}
