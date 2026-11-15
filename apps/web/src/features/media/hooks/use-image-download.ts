import { useState } from "react"

export function useImageDownload() {
  const [pending, setPending] = useState(false)
  const download = async (url: string, fileName: string) => {
    setPending(true)

    try {
      const response = await fetch(url, { mode: "cors", credentials: "omit" })

      if (!response.ok) {
        throw new Error(`Download failed with ${response.status}`)
      }

      const href = URL.createObjectURL(await response.blob())
      const anchor = document.createElement("a")

      anchor.href = href
      anchor.download = fileName
      anchor.click()
      setTimeout(() => {
        URL.revokeObjectURL(href)
      }, 1000)
    } catch {
      window.open(url, "_blank", "noopener,noreferrer")
    } finally {
      setPending(false)
    }
  }

  return { download, pending }
}
