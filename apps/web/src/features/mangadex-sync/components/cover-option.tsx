import * as stylex from "@stylexjs/stylex"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { LanguageChip } from "@/components/flags/flags"
import { api } from "@/lib/api"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  option: {
    gap: "0.5rem",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  frame: {
    borderRadius: radius.lg,
    overflow: "hidden",
    aspectRatio: "5 / 7",
    backgroundColor: colors.muted,
    position: "relative",
  },
  image: {
    display: "block",
    objectFit: "cover",
    opacity: 0.45,
    transitionDuration: "150ms",
    transitionProperty: "opacity",
    height: "100%",
    width: "100%",
  },
  picked: {
    opacity: 1,
  },
  check: {
    position: "absolute",
    left: "0.5rem",
    top: "0.5rem",
  },
  caption: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.8125rem",
    justifyContent: "space-between",
  },
})

export function CoverOption({
  cover,
  mangaDexId,
  selection,
}: {
  cover: MangaDexPlan["covers"][number]
  mangaDexId: string
  selection: PlanSelection
}) {
  const picked = selection.selected.has(cover.key)

  return (
    <label sx={styles.option}>
      <span sx={styles.frame}>
        <img
          alt={
            cover.volume === null
              ? m.mangadex_cover_no_volume()
              : m.chapter_volume({ volume: cover.volume })
          }
          loading="lazy"
          src={api["mangadex-syncs"].covers[":mangaDexId"][":fileName"]
            .$url({ param: { mangaDexId, fileName: cover.fileName } })
            .toString()}
          sx={[styles.image, picked && styles.picked]}
        />
        <Checkbox
          checked={picked}
          onCheckedChange={(checked) => {
            selection.setSelected([cover.key], checked)
          }}
          sx={styles.check}
        />
      </span>
      <span sx={styles.caption}>
        {cover.volume === null
          ? m.mangadex_cover_no_volume()
          : m.chapter_volume({ volume: cover.volume })}
        <LanguageChip language={cover.language} />
      </span>
    </label>
  )
}
