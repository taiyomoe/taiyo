import type { MediaEditField } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Toggle } from "@taiyomoe/ui/components/ui/toggle"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { MediaSuggestionDetail } from "@/features/media-suggestions/api/media-suggestions"
import { FieldEditor } from "@/features/media-suggestions/components/field-editors/field-editor"
import { FieldReviewColumn } from "@/features/media-suggestions/components/suggestion-review/field-review-column"
import {
  FIELD_LABELS,
  type MediaEditDraft,
  sameField,
  toDraft,
} from "@/features/media-suggestions/lib/media-edit-model"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  card: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  cardRejected: {
    opacity: 0.6,
  },
  cardHeader: {
    gap: "0.75rem",
    paddingBlock: "1rem",
    paddingInline: "1.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  cardTitle: {
    margin: 0,
    flexGrow: 1,
    fontSize: "1rem",
    fontWeight: 600,
  },
  accept: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
  },
  columns: {
    gap: "1px",
    backgroundColor: colors.border,
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.lg]: "repeat(auto-fit, minmax(0, 1fr))",
    },
  },
  editor: {
    paddingBlock: "1.25rem",
    paddingInline: "1.5rem",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
})

type FieldReviewProps = {
  field: MediaEditField
  suggestion: MediaSuggestionDetail
  draft: MediaEditDraft
  onDraftChange: (draft: MediaEditDraft) => void
  accepted: boolean | null
  onAcceptedChange: (accepted: boolean) => void
}

export function FieldReview({
  field,
  suggestion,
  draft,
  onDraftChange,
  accepted,
  onAcceptedChange,
}: FieldReviewProps) {
  const [adjusting, setAdjusting] = useState(false)
  const conflict = suggestion.conflicts.includes(field)
  const suggested = toDraft(suggestion.changes)
  const adjusted = !sameField(field, draft, suggested)

  return (
    <section sx={[styles.card, accepted === false && styles.cardRejected]}>
      <div sx={styles.cardHeader}>
        <h2 sx={styles.cardTitle}>{FIELD_LABELS[field]()}</h2>
        {conflict ? <Badge variant="warning">{m.suggestion_changed_since()}</Badge> : null}
        {adjusted ? <Badge variant="info">{m.suggestion_adjusted()}</Badge> : null}
        {accepted === null ? null : (
          <>
            <Toggle
              disabled={!accepted}
              onPressedChange={setAdjusting}
              pressed={adjusting}
              size="sm"
              variant="outline"
            >
              {m.suggestion_adjust()}
            </Toggle>
            <label sx={styles.accept}>
              <Switch checked={accepted} onCheckedChange={onAcceptedChange} />
              {m.suggestion_accept_field()}
            </label>
          </>
        )}
      </div>
      <div sx={styles.columns}>
        {conflict ? (
          <FieldReviewColumn
            draft={toDraft(suggestion.base)}
            field={field}
            label={m.suggestion_was()}
          />
        ) : null}
        <FieldReviewColumn
          draft={toDraft(suggestion.current)}
          field={field}
          label={m.suggestion_now()}
        />
        <FieldReviewColumn
          draft={suggested}
          field={field}
          highlight
          label={m.suggestion_suggested()}
        />
      </div>
      {adjusting && accepted === true ? (
        <div sx={styles.editor}>
          <FieldEditor draft={draft} field={field} onChange={onDraftChange} />
        </div>
      ) : null}
    </section>
  )
}
