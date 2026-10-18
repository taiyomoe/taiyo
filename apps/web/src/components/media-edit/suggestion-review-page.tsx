import type { MediaEditField } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { ArrowLeft, ExternalLink } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { Toggle } from "@taiyomoe/ui/components/ui/toggle"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import type { Session } from "@/lib/queries/session"
import { AuthAlert } from "@/components/auth/auth-alert"
import { TimeAgo, Uploader } from "@/components/chapters/chapter-meta"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { FieldEditor } from "@/components/media-edit/media-edit-fields"
import {
  FIELD_LABELS,
  getFieldsError,
  type MediaEditDraft,
  sameField,
  toChanges,
  toDraft,
} from "@/components/media-edit/media-edit-model"
import { FieldPreview } from "@/components/media-edit/media-edit-preview"
import { SUGGESTION_STATUS } from "@/components/media-edit/suggestion-row"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
import {
  type MediaSuggestionDetail,
  suggestionQueryOptions,
  useReviewSuggestion,
} from "@/lib/queries/media-edit"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  back: {
    gap: "0.375rem",
    textDecoration: "none",
    alignItems: "center",
    color: {
      default: colors.mutedForeground,
      ":hover": colors.foreground,
    },
    display: "inline-flex",
  },
  icon: {
    height: "1rem",
    width: "1rem",
  },
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  note: {
    margin: 0,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    backgroundColor: colors.card,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  noteLabel: {
    color: colors.mutedForeground,
    display: "block",
    fontSize: "0.8125rem",
    marginBottom: "0.375rem",
  },
  fields: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
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
      "@media (width >= 56rem)": "repeat(auto-fit, minmax(0, 1fr))",
    },
  },
  column: {
    gap: "0.625rem",
    paddingBlock: "1.25rem",
    paddingInline: "1.5rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  suggested: {
    backgroundColor: `color-mix(in srgb, ${colors.success} 6%, ${colors.card})`,
  },
  columnLabel: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  editor: {
    paddingBlock: "1.25rem",
    paddingInline: "1.5rem",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  footer: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    backdropFilter: "blur(12px)",
    backgroundColor: `color-mix(in srgb, ${colors.card} 92%, transparent)`,
    boxShadow: shadows.overlay,
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    zIndex: 10,
    bottom: "1rem",
  },
  footerActions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  footerText: {
    color: colors.mutedForeground,
    flexGrow: 1,
    fontSize: "0.875rem",
  },
})

function Column({
  label,
  field,
  draft,
  highlight = false,
}: {
  label: string
  field: MediaEditField
  draft: MediaEditDraft
  highlight?: boolean
}) {
  return (
    <div sx={[styles.column, highlight && styles.suggested]}>
      <span sx={styles.columnLabel}>{label}</span>
      <FieldPreview draft={draft} field={field} />
    </div>
  )
}

type FieldReviewProps = {
  field: MediaEditField
  suggestion: MediaSuggestionDetail
  draft: MediaEditDraft
  onDraftChange: (draft: MediaEditDraft) => void
  accepted: boolean | null
  onAcceptedChange: (accepted: boolean) => void
}

function FieldReview({
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
          <Column draft={toDraft(suggestion.base)} field={field} label={m.suggestion_was()} />
        ) : null}
        <Column draft={toDraft(suggestion.current)} field={field} label={m.suggestion_now()} />
        <Column draft={suggested} field={field} highlight label={m.suggestion_suggested()} />
      </div>
      {adjusting && accepted === true ? (
        <div sx={styles.editor}>
          <FieldEditor draft={draft} field={field} onChange={onDraftChange} />
        </div>
      ) : null}
    </section>
  )
}

export function SuggestionReviewPage({
  suggestionId,
  user,
}: {
  suggestionId: string
  user: Session["user"]
}) {
  const { data: suggestion } = useSuspenseQuery(suggestionQueryOptions(suggestionId))
  const reviewing =
    suggestion.status === "PENDING" && getPermissions(user)("mediaSuggestion.review")
  const [draft, setDraft] = useState(() =>
    toDraft({ ...suggestion.current, ...suggestion.changes }),
  )
  const [rejected, setRejected] = useState<MediaEditField[]>([])
  const [note, setNote] = useState("")
  const [noteRequired, setNoteRequired] = useState(false)
  const review = useReviewSuggestion()
  const navigate = useNavigate()
  const accepted = suggestion.fields.filter((field) => !rejected.includes(field))
  const error = getFieldsError(draft, accepted)
  const done = () => {
    void navigate({ to: "/dashboard/suggestions" })
  }

  return (
    <DashboardPage
      eyebrow={
        <Link
          to={reviewing ? "/dashboard/suggestions" : "/dashboard/my-suggestions"}
          {...stylex.props(styles.back)}
        >
          <ArrowLeft {...stylex.props(styles.icon)} />
          {reviewing ? m.suggestions_queue_title() : m.dashboard_nav_my_suggestions()}
        </Link>
      }
      actions={
        <Button
          render={
            <Link
              params={{ mediaId: suggestion.media.id }}
              search={{ tab: "info" }}
              target="_blank"
              to="/media/$mediaId"
            />
          }
          variant="outline"
        >
          {m.suggestion_open_media()}
          <ExternalLink />
        </Button>
      }
      title={suggestion.media.title ?? m.media_untitled()}
    >
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
      {suggestion.note === null ? null : (
        <p sx={styles.note}>
          <span sx={styles.noteLabel}>
            {m.suggestion_note_from({ name: suggestion.author.displayUsername })}
          </span>
          {suggestion.note}
        </p>
      )}
      {suggestion.reviewerNote === null ? null : (
        <p sx={styles.note}>
          <span sx={styles.noteLabel}>{m.suggestion_reviewer_note_label()}</span>
          {suggestion.reviewerNote}
        </p>
      )}
      <div sx={styles.fields}>
        {suggestion.fields.map((field) => (
          <FieldReview
            accepted={reviewing ? !rejected.includes(field) : null}
            draft={draft}
            field={field}
            key={field}
            onAcceptedChange={(value) => {
              setRejected(value ? rejected.filter((item) => item !== field) : [...rejected, field])
            }}
            onDraftChange={setDraft}
            suggestion={suggestion}
          />
        ))}
      </div>
      {reviewing ? (
        <div sx={styles.footer}>
          <AuthAlert message={review.isError ? getErrorMessage(review.error) : null} />
          <Field invalid={noteRequired && note.trim() === ""}>
            <FieldLabel>{m.suggestion_review_note()}</FieldLabel>
            <Textarea
              maxLength={2000}
              onChange={(event) => {
                setNote(event.target.value)
              }}
              placeholder={m.suggestion_review_note_placeholder()}
              rows={2}
              value={note}
            />
            {noteRequired && note.trim() === "" ? (
              <FieldError match>{m.review_reject_note_required()}</FieldError>
            ) : null}
          </Field>
          <div sx={styles.footerActions}>
            <span sx={styles.footerText}>
              {error ??
                m.suggestion_accepting({ count: accepted.length, total: suggestion.fields.length })}
            </span>
            <Button
              disabled={review.isPending}
              onClick={() => {
                setNoteRequired(true)

                if (note.trim() !== "") {
                  review.mutate(
                    { suggestionId, accept: null, note: note.trim() },
                    { onSuccess: done },
                  )
                }
              }}
              variant="outline"
            >
              {m.suggestion_reject_all()}
            </Button>
            <Button
              disabled={review.isPending || accepted.length === 0 || error !== null}
              onClick={() => {
                review.mutate(
                  { suggestionId, accept: toChanges(draft, accepted), note: note.trim() },
                  { onSuccess: done },
                )
              }}
            >
              {m.suggestion_accept()}
            </Button>
          </div>
        </div>
      ) : null}
    </DashboardPage>
  )
}
