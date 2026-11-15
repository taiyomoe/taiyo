import { config } from "@taiyomoe/config"
import { IMAGE_MIME_TYPES } from "@taiyomoe/db/constants"
import { useEffect, useRef, useState } from "react"

export type StagedImage<TFields> = TFields & {
  key: string
  file: File
  previewUrl: string
}

export function useStagedImages<TFields extends object>(
  createFields: (file: File, index: number) => TFields,
) {
  const [items, setItems] = useState<Array<StagedImage<TFields>>>([])
  const [rejected, setRejected] = useState<string[]>([])
  const urls = useRef(new Set<string>())

  useEffect(
    () => () => {
      for (const url of urls.current) {
        URL.revokeObjectURL(url)
      }
    },
    [],
  )

  const release = (removed: ReadonlyArray<StagedImage<TFields>>) => {
    for (const item of removed) {
      URL.revokeObjectURL(item.previewUrl)
      urls.current.delete(item.previewUrl)
    }
  }

  return {
    items,
    rejected,
    add: (files: readonly File[]) => {
      const accepted = files.filter(
        (file) => file.type in IMAGE_MIME_TYPES && file.size <= config.images.maxSizeBytes,
      )

      setRejected(files.filter((file) => !accepted.includes(file)).map((file) => file.name))
      setItems((current) => [
        ...current,
        ...accepted
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
          .map((file, index) => {
            const previewUrl = URL.createObjectURL(file)

            urls.current.add(previewUrl)

            return {
              ...createFields(file, current.length + index),
              key: crypto.randomUUID(),
              file,
              previewUrl,
            }
          }),
      ])
    },
    update: (key: string, patch: Partial<TFields>) => {
      setItems((current) =>
        current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
      )
    },
    updateAll: (patch: (item: StagedImage<TFields>) => Partial<TFields>) => {
      setItems((current) => current.map((item) => ({ ...item, ...patch(item) })))
    },
    remove: (key: string) => {
      setItems((current) => {
        release(current.filter((item) => item.key === key))

        return current.filter((item) => item.key !== key)
      })
    },
    clear: () => {
      setItems((current) => {
        release(current)

        return []
      })
      setRejected([])
    },
  }
}
