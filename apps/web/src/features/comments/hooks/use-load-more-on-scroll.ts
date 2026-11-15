import { type RefObject, useEffect, useEffectEvent } from "react"

export function useLoadMoreOnScroll(
  sentinel: RefObject<Element | null>,
  { enabled, onLoadMore }: { enabled: boolean; onLoadMore: () => void },
) {
  const loadMore = useEffectEvent(onLoadMore)

  useEffect(() => {
    const element = sentinel.current

    if (!enabled || element === null) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore()
        }
      },
      { rootMargin: "600px 0px" },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [enabled, sentinel])
}
