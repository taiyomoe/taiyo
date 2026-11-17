import { type ComponentType, createElement, type ReactNode, useEffect, useState } from "react"

type LazyProps = {
  /** Shown until the component is downloaded, and while a failed download waits to be retried. */
  fallback?: ReactNode
  /** Changing it retries a failed download. */
  retry?: unknown
}

/**
 * Downloads a component the first time it renders, like `React.lazy`, but a
 * failed download (offline, or a deploy that replaced the chunk) never throws
 * into the page: the fallback stays, and the download is tried again when the
 * component mounts again or its `retry` prop changes.
 */
export const createLazyComponent = <Props extends object>(
  load: () => Promise<ComponentType<Props>>,
) => {
  let loaded: ComponentType<Props> | null = null
  let pending: Promise<ComponentType<Props>> | null = null
  const fetchComponent = () => {
    pending ??= load().then(
      (component) => {
        loaded = component

        return component
      },
      (error: unknown) => {
        pending = null

        throw error
      },
    )

    return pending
  }

  return function LazyComponent(props: Props & LazyProps) {
    const { fallback = null, retry } = props
    const [component, setComponent] = useState(() => loaded)

    useEffect(() => {
      let cancelled = false

      if (component === null) {
        fetchComponent().then(
          (next) => {
            if (!cancelled) {
              setComponent(() => next)
            }
          },
          () => {},
        )
      }

      return () => {
        cancelled = true
      }
    }, [component, retry])

    return component === null ? fallback : createElement(component, props)
  }
}
