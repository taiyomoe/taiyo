import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { SearchHit } from "@/features/advanced-search/hooks/use-search-results"
import { getVisibleTags } from "@/features/advanced-search/lib/search-tags"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import { getContentLanguage } from "@/lib/locale"

const styles = stylex.create({
  tags: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
    minWidth: 0,
  },
  clamped: {
    overflow: "hidden",
    maxHeight: "1.375rem",
  },
  tag: {
    borderRadius: radius.full,
    paddingBlock: "0.125rem",
    paddingInline: "0.5rem",
    backgroundColor: colors.chip,
    color: colors.mutedForeground,
    display: "block",
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    lineHeight: "1.125rem",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  genre: {
    color: colors.foreground,
  },
  SUGGESTIVE: {
    backgroundColor: `color-mix(in srgb, ${colors.contentSuggestive} 22%, transparent)`,
    color: `color-mix(in srgb, ${colors.contentSuggestive} 60%, ${colors.foreground})`,
  },
  NSFW: {
    backgroundColor: `color-mix(in srgb, ${colors.contentNsfw} 22%, transparent)`,
    color: `color-mix(in srgb, ${colors.contentNsfw} 60%, ${colors.foreground})`,
  },
  NSFL: {
    backgroundColor: `color-mix(in srgb, ${colors.contentNsfl} 26%, transparent)`,
    color: `color-mix(in srgb, ${colors.contentNsfl} 60%, ${colors.foreground})`,
  },
})

export function ResultTags({ hit, clamp = true }: { hit: SearchHit; clamp?: boolean }) {
  const tags = getVisibleTags(hit.tagKeys, hit.spoilerTagKeys, getContentLanguage())
  const rating = hit.contentRating === "NORMAL" ? null : hit.contentRating

  if (tags.length === 0 && rating === null) {
    return null
  }

  return (
    <ul sx={[styles.tags, clamp && styles.clamped]}>
      {rating === null ? null : (
        <li>
          <span sx={[styles.tag, styles[rating]]}>{CONTENT_RATING_LABELS[rating]()}</span>
        </li>
      )}
      {tags.map((tag) => (
        <li key={tag.key}>
          <span sx={[styles.tag, tag.isGenre && styles.genre]}>{tag.name}</span>
        </li>
      ))}
    </ul>
  )
}
