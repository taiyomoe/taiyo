import { useState } from "react"
import { move } from "@/features/media-suggestions/lib/move"

export const useRowKeys = (length: number) => {
  const [keys, setKeys] = useState<string[]>(() =>
    Array.from({ length }, () => crypto.randomUUID()),
  )
  const synced =
    keys.length === length
      ? keys
      : Array.from({ length }, (_, index) => keys[index] ?? `row-${index}`)

  return {
    keys: synced,
    add: () => {
      setKeys([...synced, crypto.randomUUID()])
    },
    remove: (index: number) => {
      setKeys(synced.filter((_, i) => i !== index))
    },
    move: (index: number, offset: number) => {
      setKeys(move(synced, index, offset))
    },
  }
}
