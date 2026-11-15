import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { SearchHit } from "@/features/advanced-search/hooks/use-search-results"
import { RichText } from "@/components/rich-text/rich-text"
import { parseRichText } from "@/components/rich-text/rich-text-document"
import { getSynopsis } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  synopsis: (lines: number) => ({
    overflow: "hidden",
    fontSize: "0.9375rem",
    maskImage: `linear-gradient(to bottom, black ${(lines - 1) * 1.6}em, transparent ${lines * 1.6}em)`,
    maxHeight: `${lines * 1.6}em`,
    minWidth: 0,
  }),
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontStyle: "italic",
  },
})

export function ResultSynopsis({ hit, lines }: { hit: SearchHit; lines: number }) {
  const document = parseRichText(getSynopsis(hit.synopsis))

  if (document.children.length === 0) {
    return <p sx={styles.empty}>{m.media_info_no_synopsis()}</p>
  }

  return (
    <div sx={styles.synopsis(lines)}>
      <RichText document={document} size="sm" />
    </div>
  )
}
