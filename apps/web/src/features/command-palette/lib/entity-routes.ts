import type { NavigateOptions } from "@tanstack/react-router"
import type { PaletteEntity } from "@/features/command-palette/lib/palette-command"

export const entityRoute = (entity: PaletteEntity): NavigateOptions => {
  if (entity.kind === "title") {
    return { to: "/media/$mediaId", params: { mediaId: entity.id } }
  }

  if (entity.kind === "group") {
    return { to: "/groups/$groupId", params: { groupId: entity.id } }
  }

  return { to: "/users/$username", params: { username: entity.username } }
}
