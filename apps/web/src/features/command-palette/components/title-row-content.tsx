import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { TitleEntity } from "@/features/command-palette/lib/palette-command"
import { paletteRowStyles } from "@/features/command-palette/components/palette-row-styles"
import { Cover } from "@/features/media/components/cover"
import { MEDIA_TYPE_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  cover: {
    width: "2.75rem",
  },
  heading: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    minWidth: 0,
  },
  meta: {
    flexShrink: 0,
  },
  matched: {
    color: colors.foreground,
    opacity: 0.72,
  },
})

export function TitleRowContent({ title }: { title: TitleEntity }) {
  const meta = [MEDIA_TYPE_LABELS[title.type](), title.year]
    .filter((part) => part !== null)
    .join(" · ")

  return (
    <>
      <Cover src={title.coverUrl} sx={[paletteRowStyles.media, styles.cover]} />
      <span sx={paletteRowStyles.text}>
        <span sx={styles.heading}>
          <span sx={paletteRowStyles.primary}>{title.title}</span>
          {meta === "" ? null : <span sx={[paletteRowStyles.secondary, styles.meta]}>{meta}</span>}
        </span>
        {title.matchedTitle === null ? null : (
          <span sx={[paletteRowStyles.secondary, styles.matched]}>
            {m.palette_title_matched({ title: title.matchedTitle })}
          </span>
        )}
        <span
          sx={[paletteRowStyles.secondary, title.matchedTitle === null && paletteRowStyles.clamp]}
        >
          {title.synopsis === "" ? m.media_info_no_synopsis() : title.synopsis}
        </span>
      </span>
    </>
  )
}
