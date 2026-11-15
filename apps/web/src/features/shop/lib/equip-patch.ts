import type { CosmeticKind } from "@taiyomoe/db/cosmetics"
import { AVATAR_BORDER_KEYS, NAME_EFFECT_KEYS, USER_TITLE_KEYS } from "@taiyomoe/db/cosmetics"

export const toEquipPatch = (kind: CosmeticKind, key: string) => {
  if (kind === "AVATAR_BORDER") {
    const avatarBorder = AVATAR_BORDER_KEYS.find((candidate) => candidate === key)

    return avatarBorder === undefined ? null : { avatarBorder }
  }

  if (kind === "NAME_EFFECT") {
    const nameEffect = NAME_EFFECT_KEYS.find((candidate) => candidate === key)

    return nameEffect === undefined ? null : { nameEffect }
  }

  const title = USER_TITLE_KEYS.find((candidate) => candidate === key)

  return title === undefined ? null : { title }
}
