import { useEffect, useState } from "react"

const COPIED_MS = 2000

export const useCopy = () => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = copied
      ? setTimeout(() => {
          setCopied(false)
        }, COPIED_MS)
      : undefined

    return () => {
      clearTimeout(timer)
    }
  }, [copied])

  return {
    copied,
    copy: (text: string) => {
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
      })
    },
  }
}
