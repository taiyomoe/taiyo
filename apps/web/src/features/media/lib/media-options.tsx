import * as stylex from "@stylexjs/stylex"
import {
  CONTENT_RATINGS,
  type ContentRating,
  FLAGS,
  type Flag,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  type MediaCountryOfOrigin,
  type MediaDemography,
  type MediaSource,
  type MediaStatus,
  type MediaType,
  STAFF_ROLES,
  type StaffRole,
} from "@taiyomoe/db/constants"
import {
  Activity,
  ArrowUpDown,
  Book,
  BookOpenText,
  Crown,
  Flame,
  Globe,
  Image,
  Kissing,
  Library,
  Lock,
  Monitor,
  MoreCircle,
  PenTool,
  Pipette,
  Play,
  Shield,
  ShieldCheck,
  Skull,
  Sparkles,
  Users,
} from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { OptionIcon, OptionSet } from "@/components/fields/option-select"
import { statusDotIcon } from "@/components/fields/status-dot"
import { CountryFlag } from "@/components/flags/flags"
import { STAFF_ROLE_LABELS } from "@/features/media-suggestions/lib/media-edit-labels"
import {
  CONTENT_RATING_LABELS,
  MEDIA_COUNTRY_LABELS,
  MEDIA_FLAG_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_SOURCE_LABELS,
  MEDIA_STATUS_BADGES,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
} from "@/features/media/lib/media-labels"

const styles = stylex.create({
  NORMAL: { color: colors.mutedForeground },
  SUGGESTIVE: { color: colors.contentSuggestive },
  NSFW: { color: colors.contentNsfw },
  NSFL: { color: colors.contentNsfl },
  OK: { color: colors.mutedForeground },
  STAFF_ONLY: { color: colors.mutedForeground },
  VIP_ONLY: { color: colors.mutedForeground },
  LOCKED: { color: colors.warning },
})
const flagIcon = (country: MediaCountryOfOrigin): OptionIcon =>
  function Flag() {
    return <CountryFlag country={country} />
  }
// Flags mean the country of origin everywhere else, and rows and grids are view modes, so a
// type gets an icon of its own: a manga is read in pages, a manhwa scrolls down one long
// strip, a manhua is drawn in full colour.
const TYPE_ICONS: Record<MediaType, OptionIcon> = {
  MANGA: Book,
  MANHWA: ArrowUpDown,
  MANHUA: Image,
  LIGHT_NOVEL: BookOpenText,
  OTHER: MoreCircle,
}
const SOURCE_ICONS: Record<MediaSource, OptionIcon> = {
  ORIGINAL: PenTool,
  LIGHT_NOVEL: BookOpenText,
  VISUAL_NOVEL: Monitor,
  WEB_NOVEL: Globe,
  VIDEO_GAME: Play,
}
const RATING_ICONS: Record<ContentRating, OptionIcon> = {
  NORMAL: ShieldCheck,
  SUGGESTIVE: Kissing,
  NSFW: Flame,
  NSFL: Skull,
}
const FLAG_ICONS: Record<Flag, OptionIcon> = {
  OK: Globe,
  STAFF_ONLY: Shield,
  VIP_ONLY: Crown,
  LOCKED: Lock,
}
const STATUS_ICONS: Record<MediaStatus, OptionIcon> = {
  RELEASING: statusDotIcon(MEDIA_STATUS_BADGES.RELEASING),
  FINISHED: statusDotIcon(MEDIA_STATUS_BADGES.FINISHED),
  NOT_YET_RELEASED: statusDotIcon(MEDIA_STATUS_BADGES.NOT_YET_RELEASED),
  CANCELLED: statusDotIcon(MEDIA_STATUS_BADGES.CANCELLED),
  HIATUS: statusDotIcon(MEDIA_STATUS_BADGES.HIATUS),
}

export const MEDIA_TYPE_OPTIONS: OptionSet<MediaType> = {
  values: MEDIA_TYPES,
  label: (type) => MEDIA_TYPE_LABELS[type](),
  icon: (type) => TYPE_ICONS[type],
  fieldIcon: Library,
}

export const MEDIA_STATUS_OPTIONS: OptionSet<MediaStatus> = {
  values: MEDIA_STATUSES,
  label: (status) => MEDIA_STATUS_LABELS[status](),
  icon: (status) => STATUS_ICONS[status],
  fieldIcon: Activity,
}

export const MEDIA_SOURCE_OPTIONS: OptionSet<MediaSource> = {
  values: MEDIA_SOURCES,
  label: (source) => MEDIA_SOURCE_LABELS[source](),
  icon: (source) => SOURCE_ICONS[source],
  fieldIcon: Sparkles,
}

export const MEDIA_DEMOGRAPHY_OPTIONS: OptionSet<MediaDemography> = {
  values: MEDIA_DEMOGRAPHIES,
  label: (demography) => MEDIA_DEMOGRAPHY_LABELS[demography](),
  icon: () => Users,
  fieldIcon: Users,
}

export const MEDIA_COUNTRY_OPTIONS: OptionSet<MediaCountryOfOrigin> = {
  values: MEDIA_COUNTRIES_OF_ORIGIN,
  label: (country) => MEDIA_COUNTRY_LABELS[country](),
  icon: flagIcon,
  fieldIcon: Globe,
}

export const CONTENT_RATING_OPTIONS: OptionSet<ContentRating> = {
  values: CONTENT_RATINGS,
  label: (rating) => CONTENT_RATING_LABELS[rating](),
  icon: (rating) => RATING_ICONS[rating],
  tone: (rating) => styles[rating],
  fieldIcon: Shield,
}

export const MEDIA_FLAG_OPTIONS: OptionSet<Flag> = {
  values: FLAGS,
  label: (flag) => MEDIA_FLAG_LABELS[flag](),
  icon: (flag) => FLAG_ICONS[flag],
  tone: (flag) => styles[flag],
  fieldIcon: Lock,
}

export const STAFF_ROLE_OPTIONS: OptionSet<StaffRole> = {
  values: STAFF_ROLES,
  label: (role) => STAFF_ROLE_LABELS[role](),
  icon: (role) => (role === "AUTHOR" ? PenTool : Pipette),
  fieldIcon: Users,
}
