import type { MediaType } from "@taiyomoe/db/constants"
import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { NavigateOptions } from "@tanstack/react-router"
import type { ReactElement } from "react"

export type PaletteSection =
  | "context"
  | "navigate"
  | "create"
  | "dashboard"
  | "preferences"
  | "account"
  | "help"

export type PaletteCommand = {
  id: string
  label: string
  section: PaletteSection
  icon: (props: IconProps) => ReactElement
  keywords?: readonly string[]
  hint?: string
  subject?: string
  checked?: boolean
  run: PaletteRun
}

export type PalettePage = {
  title: string
  commands: () => readonly PaletteCommand[]
}

export type PaletteRun =
  | { type: "navigate"; to: NavigateOptions }
  | { type: "external"; href: string }
  | { type: "perform"; perform: () => unknown }
  | { type: "copy"; text: () => string }
  | { type: "page"; page: PalettePage }

export type TitleEntity = {
  kind: "title"
  id: string
  title: string
  matchedTitle: string | null
  synopsis: string
  coverUrl: string | null
  type: MediaType
  year: number | null
}

export type GroupEntity = {
  kind: "group"
  id: string
  name: string
  description: string | null
  logoUrl: string | null
}

export type UserEntity = {
  kind: "user"
  id: string
  username: string
  displayUsername: string
  image: string | null
}

export type PaletteEntity = TitleEntity | GroupEntity | UserEntity

export type PaletteItem =
  | { kind: "command"; key: string; label: string; command: PaletteCommand }
  | { kind: "entity"; key: string; label: string; entity: PaletteEntity }

export type PaletteGroup = {
  value: string
  label: string
  items: PaletteItem[]
}

export const entityKey = (entity: PaletteEntity) => `${entity.kind}:${entity.id}`

export const entityLabel = (entity: PaletteEntity) => {
  if (entity.kind === "title") {
    return entity.title
  }

  return entity.kind === "group" ? entity.name : entity.displayUsername
}

export const commandItem = (command: PaletteCommand): PaletteItem => ({
  kind: "command",
  key: `command:${command.id}`,
  label: command.label,
  command,
})

export const entityItem = (entity: PaletteEntity): PaletteItem => ({
  kind: "entity",
  key: entityKey(entity),
  label: entityLabel(entity),
  entity,
})

export const isPaletteItem = (value: unknown): value is PaletteItem =>
  typeof value === "object" && value !== null && "kind" in value && "key" in value
