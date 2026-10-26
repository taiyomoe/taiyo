import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Badge, type BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { MediaSuggestion } from "@/features/media-suggestions/api/media-suggestions"
import { ListRow } from "@/components/layout/dashboard-page"
import { TimeAgo } from "@/components/time/time-ago"
import { Uploader } from "@/features/chapters/components/uploader"
import { FIELD_LABELS } from "@/features/media-suggestions/lib/media-edit-model"
import { Cover } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

export const SUGGESTION_STATUS: Record<
  MediaSuggestion["status"],
  { label: () => string; variant: BadgeVariant }
> = {
  PENDING: { label: m.submission_status_pending, variant: "warning" },
  ACCEPTED: { label: m.suggestion_status_accepted, variant: "success" },
  REJECTED: { label: m.submission_status_rejected, variant: "error" },
  WITHDRAWN: { label: m.suggestion_status_withdrawn, variant: "secondary" },
}

const styles = stylex.create({
  cover: {
    flexShrink: 0,
    width: "3rem",
  },
  main: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  media: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  fields: {
    gap: "0.25rem",
    display: "flex",
    flexWrap: "wrap",
  },
  note: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontStyle: "italic",
    overflowWrap: "anywhere",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexShrink: 0,
  },
})

export function SuggestionRow({
  suggestion,
  showAuthor = false,
  actions,
}: {
  suggestion: MediaSuggestion
  showAuthor?: boolean
  actions?: ReactNode
}) {
  return (
    <ListRow>
      <Cover src={suggestion.media.coverUrl} sx={styles.cover} />
      <div sx={styles.main}>
        <div sx={styles.titleLine}>
          <Link
            params={{ mediaId: suggestion.media.id }}
            search={{ tab: "info" }}
            to="/media/$mediaId"
            {...stylex.props(styles.media)}
          >
            {suggestion.media.title ?? m.media_untitled()}
          </Link>
          <Badge variant={SUGGESTION_STATUS[suggestion.status].variant}>
            {SUGGESTION_STATUS[suggestion.status].label()}
          </Badge>
        </div>
        <div sx={styles.fields}>
          {suggestion.fields.map((field) => {
            let variant: BadgeVariant = "outline"

            if (suggestion.conflicts.includes(field)) {
              variant = "warning"
            } else if (suggestion.status === "ACCEPTED") {
              variant = suggestion.acceptedFields.includes(field) ? "success" : "secondary"
            }

            return (
              <Badge key={field} variant={variant}>
                {FIELD_LABELS[field]()}
              </Badge>
            )
          })}
        </div>
        <div sx={styles.meta}>
          {showAuthor ? <Uploader uploader={suggestion.author} /> : null}
          {suggestion.conflicts.length === 0 ? null : (
            <span>{m.suggestion_conflicts({ count: suggestion.conflicts.length })}</span>
          )}
          <TimeAgo date={suggestion.createdAt} />
        </div>
        {suggestion.reviewerNote === null ? null : (
          <p sx={styles.note}>{m.suggestion_reviewer_note({ note: suggestion.reviewerNote })}</p>
        )}
      </div>
      {actions === undefined ? null : <div sx={styles.actions}>{actions}</div>}
    </ListRow>
  )
}
