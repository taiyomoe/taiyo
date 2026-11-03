import { MEDIA_TYPES } from "@taiyomoe/db/constants"
import { useSyncExternalStore } from "react"
import { z } from "zod"
import { type PaletteEntity, entityKey } from "@/features/command-palette/lib/palette-command"

const STORAGE_KEY = "taiyo:palette-recents"
const MAX_RECENTS = 6
const entitySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("title"),
    id: z.string(),
    title: z.string(),
    matchedTitle: z.null().default(null),
    synopsis: z.string(),
    coverUrl: z.string().nullable(),
    type: z.enum(MEDIA_TYPES),
    year: z.number().nullable(),
  }),
  z.object({
    kind: z.literal("group"),
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    logoUrl: z.string().nullable(),
  }),
  z.object({
    kind: z.literal("user"),
    id: z.string(),
    username: z.string(),
    displayUsername: z.string(),
    image: z.string().nullable(),
  }),
])
const listeners = new Set<() => void>()
const EMPTY: readonly PaletteEntity[] = []
let cache: { raw: string | null; entities: readonly PaletteEntity[] } | null = null
const read = () => {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (cache?.raw !== raw) {
    const result = z
      .string()
      .transform((value, context): unknown => {
        try {
          return JSON.parse(value)
        } catch {
          context.addIssue({ code: "custom", message: "Invalid JSON" })

          return z.NEVER
        }
      })
      .pipe(entitySchema.array())
      .safeParse(raw ?? "[]")

    cache = { raw, entities: result.success ? result.data : EMPTY }
  }

  return cache.entities
}
const write = (entities: readonly PaletteEntity[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entities))

  for (const listener of listeners) {
    listener()
  }
}
const subscribe = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener()
    }
  }

  listeners.add(listener)
  window.addEventListener("storage", onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export const rememberEntity = (found: PaletteEntity) => {
  const entity = found.kind === "title" ? { ...found, matchedTitle: null } : found
  const key = entityKey(entity)
  const current = read()

  if (current[0] !== undefined && JSON.stringify(current[0]) === JSON.stringify(entity)) {
    return
  }

  write([entity, ...current.filter((other) => entityKey(other) !== key)].slice(0, MAX_RECENTS))
}

export const useRecentEntities = () => useSyncExternalStore(subscribe, read, () => EMPTY)
