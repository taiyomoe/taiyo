import { useCallback, useEffect, useRef, useState } from "react"

export function useCurrentPage(pageCount: number) {
  const [current, setCurrent] = useState(0)
  const observer = useRef<IntersectionObserver | null>(null)
  const pending = useRef(new Set<Element>())

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setCurrent(Number((entry.target as HTMLElement).dataset.index))
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    )

    for (const element of pending.current) {
      observer.current.observe(element)
    }

    return () => observer.current?.disconnect()
  }, [pageCount])

  const observe = useCallback((element: HTMLElement | null) => {
    if (!element) {
      return
    }

    pending.current.add(element)
    observer.current?.observe(element)

    return () => {
      pending.current.delete(element)
      observer.current?.unobserve(element)
    }
  }, [])

  return { current, observe }
}
