import { type RefObject, useEffect, useState } from "react"

export function useNearViewport(
  target: RefObject<Element | null>,
  root: RefObject<Element | null>,
  margin: string,
) {
  const [near, setNear] = useState(false)

  useEffect(() => {
    const element = target.current

    if (near || element === null) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true)
        }
      },
      { root: root.current, rootMargin: margin },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [margin, near, root, target])

  return near
}
