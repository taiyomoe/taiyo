import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import type { RankedThumb } from "@/features/rankings/lib/ranking-entries"
import {
  GroupAvatar,
  glowingFallback,
  initialsOf,
  PersonAvatar,
  toneFor,
} from "@/features/groups/components/group-avatar"
import { Cover } from "@/features/media/components/cover"

/**
 * The thumbnails read their size from the custom properties of the spot they sit in:
 * `--thumb` for avatars and logos, `--cover-w` and `--cover-h` for covers.
 */
const styles = stylex.create({
  person: {
    fontSize: "calc(var(--thumb) * 0.3)",
    height: "var(--thumb)",
    width: "var(--thumb)",
  },
  initials: {
    fontSize: "inherit",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  group: {
    borderRadius: "calc(var(--thumb) * 0.28)",
    fontSize: "calc(var(--thumb) * 0.3)",
    height: "var(--thumb)",
    width: "var(--thumb)",
  },
  cover: {
    borderRadius: "calc(var(--cover-h) * 0.1)",
    aspectRatio: "auto",
    height: "var(--cover-h)",
    width: "var(--cover-w)",
  },
  coverFallback: {
    inset: 0,
    alignItems: "center",
    display: "flex",
    fontSize: "calc(var(--cover-w) * 0.3)",
    fontWeight: 700,
    justifyContent: "center",
    letterSpacing: "-0.01em",
    position: "absolute",
  },
})

export function RankingThumb({ thumb, sx }: { thumb: RankedThumb; sx?: Sx }) {
  if (thumb.kind === "user") {
    return (
      <PersonAvatar fallbackSx={styles.initials} glow person={thumb} sx={[styles.person, sx]} />
    )
  }

  if (thumb.kind === "group") {
    return (
      <GroupAvatar
        glow
        id={thumb.id}
        logoUrl={thumb.logoUrl}
        name={thumb.name}
        sx={[styles.group, sx]}
      />
    )
  }

  return (
    <Cover
      fallback={
        <span aria-hidden style={glowingFallback(toneFor(thumb.id))} sx={styles.coverFallback}>
          {initialsOf(thumb.name)}
        </span>
      }
      src={thumb.coverUrl}
      sx={[styles.cover, sx]}
    />
  )
}
