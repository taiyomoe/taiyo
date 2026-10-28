import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaSuggestionDetail } from "@/features/media-suggestions/api/media-suggestions"
import { TimeAgo } from "@/components/time/time-ago"
import { Uploader } from "@/features/chapters/components/uploader"
import { SUGGESTION_STATUS } from "@/features/media-suggestions/lib/suggestion-status"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
})

export function SuggestionMeta({ suggestion }: { suggestion: MediaSuggestionDetail }) {
  return (
    <div sx={styles.meta}>
      <Badge variant={SUGGESTION_STATUS[suggestion.status].variant}>
        {SUGGESTION_STATUS[suggestion.status].label()}
      </Badge>
      <Uploader uploader={suggestion.author} />
      <TimeAgo date={suggestion.createdAt} />
      {suggestion.reviewer === null ? null : (
        <span>{m.suggestion_reviewed_by({ name: suggestion.reviewer.displayUsername })}</span>
      )}
    </div>
  )
}
