import type { Gender } from "@taiyomoe/db/constants"
import type {
  AvatarBorder,
  CosmeticKind,
  CosmeticRarity,
  CosmeticUnlock,
  NameEffect,
  UserTitle,
} from "@taiyomoe/db/cosmetics"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

type Label = () => string

export const NAME_EFFECT_LABELS: Record<NameEffect, Label> = {
  sunrise: m.name_effect_sunrise,
  crimson: m.name_effect_crimson,
  azure: m.name_effect_azure,
  jade: m.name_effect_jade,
  ember: m.name_effect_ember,
  tide: m.name_effect_tide,
  sakura: m.name_effect_sakura,
  frost: m.name_effect_frost,
  gold: m.name_effect_gold,
  neon: m.name_effect_neon,
  aurora: m.name_effect_aurora,
  void: m.name_effect_void,
  holo: m.name_effect_holo,
  glitch: m.name_effect_glitch,
  inferno: m.name_effect_inferno,
  galaxy: m.name_effect_galaxy,
  prism: m.name_effect_prism,
  opal: m.name_effect_opal,
}

export const USER_TITLE_LABELS: Record<UserTitle, Label> = {
  reader: m.user_title_reader,
  newcomer: m.user_title_newcomer,
  administrator: m.user_title_administrator,
  moderator: m.user_title_moderator,
  uploader: m.user_title_uploader,
  bookworm: m.user_title_bookworm,
  bingeReader: m.user_title_binge_reader,
  livingLibrary: m.user_title_living_library,
  contributor: m.user_title_contributor,
  scanlationHero: m.user_title_scanlation_hero,
  socialite: m.user_title_socialite,
  chatterbox: m.user_title_chatterbox,
  nightOwl: m.user_title_night_owl,
  sunChaser: m.user_title_sun_chaser,
  sensei: m.user_title_sensei,
  legend: m.user_title_legend,
  treasureHunter: m.user_title_treasure_hunter,
  fortunesFavorite: m.user_title_fortunes_favorite,
}

export const AVATAR_BORDER_LABELS: Record<AvatarBorder, Label> = {
  halo: m.avatar_border_halo,
  dusk: m.avatar_border_dusk,
  petals: m.avatar_border_petals,
  tidal: m.avatar_border_tidal,
  circuit: m.avatar_border_circuit,
  orbit: m.avatar_border_orbit,
  frostbite: m.avatar_border_frostbite,
  thorns: m.avatar_border_thorns,
  solar: m.avatar_border_solar,
  phoenix: m.avatar_border_phoenix,
  nebula: m.avatar_border_nebula,
  eclipse: m.avatar_border_eclipse,
}

export const COSMETIC_KIND_LABELS: Record<CosmeticKind, Label> = {
  NAME_EFFECT: m.shop_kind_name_effect,
  TITLE: m.shop_kind_title,
  AVATAR_BORDER: m.shop_kind_avatar_border,
}

export const getCosmeticLabel = (kind: CosmeticKind, key: string) => {
  const labels: Record<string, Label> = {
    NAME_EFFECT: NAME_EFFECT_LABELS,
    TITLE: USER_TITLE_LABELS,
    AVATAR_BORDER: AVATAR_BORDER_LABELS,
  }[kind]

  return Object.hasOwn(labels, key) ? (labels[key]?.() ?? key) : key
}

export const RARITY_LABELS: Record<CosmeticRarity, Label> = {
  common: m.rarity_common,
  rare: m.rarity_rare,
  epic: m.rarity_epic,
  legendary: m.rarity_legendary,
}

export const GENDER_LABELS: Record<Gender, Label> = {
  MALE: m.gender_male,
  FEMALE: m.gender_female,
  OTHER: m.gender_other,
  NOT_SPECIFIED: m.gender_not_specified,
}

export const describeUnlock = (unlock: CosmeticUnlock) => {
  if (unlock.type === "role") {
    return m.profile_unlock_role({
      roles: new Intl.ListFormat(undefined, { type: "disjunction" }).format(
        unlock.roles.map((role) => ROLE_LABELS[role]()),
      ),
    })
  }

  if (unlock.type === "lootBox") {
    return m.profile_unlock_loot_box()
  }

  if (unlock.type === "shop") {
    return m.profile_unlock_shop({ price: unlock.price.toLocaleString(getLocale()) })
  }

  if (unlock.type === "achievement") {
    const threshold = unlock.threshold.toLocaleString(getLocale())

    if (unlock.metric === "chaptersRead") {
      return m.profile_unlock_chapters_read({ threshold })
    }

    if (unlock.metric === "chaptersUploaded") {
      return m.profile_unlock_chapters_uploaded({ threshold })
    }

    return unlock.metric === "followers"
      ? m.profile_unlock_followers({ threshold })
      : m.profile_unlock_comments_written({ threshold })
  }

  return m.profile_unlock_free()
}
