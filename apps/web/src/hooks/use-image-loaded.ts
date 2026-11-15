import { useCallback, useState } from "react"

type ImageStatus = "loading" | "loaded" | "failed"

export const useImageLoaded = () => {
  const [status, setStatus] = useState<ImageStatus>("loading")
  const ref = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete === true) {
      setStatus(node.naturalWidth > 0 ? "loaded" : "failed")
    }
  }, [])
  const onLoad = useCallback(() => {
    setStatus("loaded")
  }, [])
  const onError = useCallback(() => {
    setStatus("failed")
  }, [])

  return { loaded: status === "loaded", failed: status === "failed", ref, onLoad, onError }
}
