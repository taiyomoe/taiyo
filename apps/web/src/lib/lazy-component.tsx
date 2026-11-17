import {
  type ComponentType,
  createElement,
  type ReactNode,
  Suspense,
  use,
  useEffect,
  useState,
} from "react"

type LazyProps = {
  /** Shown while the component downloads, and after a download failed. */
  fallback?: ReactNode
  /** Changing it retries a failed download. */
  retry?: unknown
}

/**
 * Downloads a component the first time it renders, like `React.lazy`: the
 * server renders it, and hydration keeps that markup until the code arrives.
 * Unlike `React.lazy`, a failed download (offline, or a deploy that replaced
 * the chunk) never throws into the page: the fallback shows, and the download
 * is tried again on the next mount, when the `retry` prop changes, or when the
 * browser comes back online.
 */
export const createLazyComponent = <Props extends object>(
  load: () => Promise<ComponentType<Props>>,
) => {
  let attempt: Promise<ComponentType<Props> | null> | null = null
  let failed = false
  const getAttempt = () => {
    attempt ??= load().catch(() => {
      failed = true

      return null
    })

    return attempt
  }

  function Loaded({ props }: { props: Props & LazyProps }) {
    // Once settled, the same promise hands the component back without suspending.
    const component = use(getAttempt())

    return component === null ? (props.fallback ?? null) : createElement(component, props)
  }

  return function LazyComponent(props: Props & LazyProps) {
    const [tries, setTries] = useState(0)

    useEffect(() => {
      const tryAgain = () => {
        if (failed) {
          failed = false
          attempt = null
          setTries((count) => count + 1)
        }
      }

      tryAgain()
      window.addEventListener("online", tryAgain)

      return () => {
        window.removeEventListener("online", tryAgain)
      }
    }, [props.retry])

    return (
      <Suspense fallback={props.fallback ?? null}>
        <Loaded key={tries} props={props} />
      </Suspense>
    )
  }
}
