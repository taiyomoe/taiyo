import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  Banner,
  CloudUpload,
  History,
  Image,
  Library,
  List,
  ListNumbered,
  Mail,
  NoteEdit,
  PenTool,
  Robot,
  Shield,
  User,
  UserCheck,
  Users,
} from "@taiyomoe/ui/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { AuditLogEntry } from "@/lib/queries/audit-logs"

type Preview = NonNullable<AuditLogEntry["preview"]>

const TONES = [
  colors.chart1,
  colors.chart2,
  colors.chart3,
  colors.chart4,
  colors.chart5,
  colors.info,
]
const CATEGORY_TONES: Record<string, string> = {
  auth: colors.info,
  admin: colors.destructive,
  user: colors.chart2,
  media: colors.chart1,
  staff: colors.chart4,
  chapter: colors.chart5,
  group: colors.chart3,
  list: colors.chart4,
  library: colors.chart2,
  history: colors.info,
  audit: colors.mutedForeground,
}
const TARGET_ICONS: Record<string, (props: IconProps) => ReactElement> = {
  media: Library,
  mediaSuggestion: NoteEdit,
  cover: Image,
  banner: Banner,
  chapter: ListNumbered,
  task: CloudUpload,
  group: Users,
  ownershipRequest: Shield,
  groupCreationRequest: UserCheck,
  groupInvitation: Mail,
  user: User,
  staff: PenTool,
  list: List,
  auditLog: History,
}

export const getCategoryTone = (category: string) => CATEGORY_TONES[category] ?? colors.primary

const getTone = (seed: string) => {
  let hash = 0

  for (const char of seed) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 2_147_483_647
  }

  return TONES[hash % TONES.length] ?? colors.primary
}
const graphemes = new Intl.Segmenter()
const initialOf = (name: string) =>
  graphemes.segment(name.trim()).containing(0)?.segment.toUpperCase() ?? "?"
const styles = stylex.create({
  avatar: (size: string) => ({
    flexShrink: 0,
    fontSize: `calc(${size} * 0.42)`,
    fontWeight: 700,
    height: size,
    width: size,
  }),
  fallback: (color: string) => ({
    backgroundColor: color,
    color: colors.primaryForeground,
  }),
  glyph: (color: string) => ({
    borderRadius: radius.full,
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
    color,
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
  }),
  size: (size: string) => ({
    height: size,
    width: size,
  }),
  cover: {
    borderRadius: radius.sm,
    overflow: "hidden",
    aspectRatio: "2 / 3",
    backgroundColor: colors.well,
    boxShadow: `0 0 0 1px ${colors.border}`,
    flexShrink: 0,
    position: "relative",
  },
  coverSize: (height: string) => ({
    height,
  }),
  image: {
    inset: 0,
    display: "block",
    objectFit: "cover",
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  tile: (color: string) => ({
    borderRadius: radius.md,
    overflow: "hidden",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
    color,
    display: "inline-flex",
    flexShrink: 0,
    fontWeight: 700,
    justifyContent: "center",
    position: "relative",
  }),
  coverIcon: {
    inset: 0,
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
  },
})

export function PersonAvatar({
  name,
  image,
  seed,
  size = "2rem",
}: {
  name: string
  image: string | null
  seed: string
  size?: string
}) {
  return (
    <Avatar sx={styles.avatar(size)}>
      {image === null || image === "" ? null : <AvatarImage alt="" src={image} />}
      <AvatarFallback sx={styles.fallback(getTone(seed))}>{initialOf(name)}</AvatarFallback>
    </Avatar>
  )
}

export function ActorAvatar({
  actor,
  size = "2rem",
}: {
  actor: AuditLogEntry["actor"]
  size?: string
}) {
  if (actor.type !== "user") {
    return (
      <span aria-hidden sx={[styles.glyph(colors.chart3), styles.size(size)]}>
        <Robot size={16} />
      </span>
    )
  }

  if (actor.id === "anonymous") {
    return (
      <span aria-hidden sx={[styles.glyph(colors.mutedForeground), styles.size(size)]}>
        <User size={16} />
      </span>
    )
  }

  return (
    <PersonAvatar
      image={actor.user?.image ?? null}
      name={actor.user?.displayUsername ?? actor.displayName ?? actor.id}
      seed={actor.id}
      size={size}
    />
  )
}

function CoverThumb({ src, height }: { src: string | null; height: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <span aria-hidden sx={[styles.cover, styles.coverSize(height)]}>
      {src === null || failed ? (
        <span sx={styles.coverIcon}>
          <Library size={14} />
        </span>
      ) : (
        <img
          alt=""
          decoding="async"
          loading="lazy"
          onError={() => {
            setFailed(true)
          }}
          src={src}
          sx={styles.image}
        />
      )}
    </span>
  )
}

function LogoTile({ preview, size }: { preview: Preview; size: string }) {
  const [failed, setFailed] = useState(false)
  const tone = getTone(preview.id)

  return (
    <span aria-hidden sx={[styles.tile(tone), styles.size(size)]}>
      {preview.image === null || failed ? (
        initialOf(preview.label ?? "?")
      ) : (
        <img
          alt=""
          loading="lazy"
          onError={() => {
            setFailed(true)
          }}
          src={preview.image}
          sx={styles.image}
        />
      )}
    </span>
  )
}

export function TargetThumb({
  preview,
  targetType,
  category,
  size = "2rem",
}: {
  preview: AuditLogEntry["preview"]
  targetType: string
  category: string
  size?: string
}) {
  if (preview?.kind === "media") {
    return <CoverThumb height={`calc(${size} * 1.4)`} src={preview.image} />
  }

  if (preview?.kind === "group") {
    return <LogoTile preview={preview} size={size} />
  }

  if (preview?.kind === "user" || preview?.kind === "staff") {
    return (
      <PersonAvatar
        image={preview.image}
        name={preview.label ?? "?"}
        seed={preview.id}
        size={size}
      />
    )
  }

  const Icon = TARGET_ICONS[targetType] ?? History

  return (
    <span aria-hidden sx={[styles.tile(getCategoryTone(category)), styles.size(size)]}>
      <Icon size={16} />
    </span>
  )
}
