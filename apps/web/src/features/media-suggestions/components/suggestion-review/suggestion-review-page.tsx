import type { MediaEditField } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { ArrowLeft, ExternalLink } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { DashboardPage } from "@/components/layout/dashboard-page"
import {
  suggestionQueryOptions,
  useReviewSuggestion,
} from "@/features/media-suggestions/api/media-suggestions"
import { FieldReview } from "@/features/media-suggestions/components/suggestion-review/field-review"
import { SuggestionMeta } from "@/features/media-suggestions/components/suggestion-review/suggestion-meta"
import { SuggestionNote } from "@/features/media-suggestions/components/suggestion-review/suggestion-note"
import { SuggestionReviewFooter } from "@/features/media-suggestions/components/suggestion-review/suggestion-review-footer"
import {
  getFieldsError,
  toChanges,
  toDraft,
} from "@/features/media-suggestions/lib/media-edit-model"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/suggestions/$suggestionId")
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
  fields: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function SuggestionReviewPage() {
  const { session } = routeApi.useRouteContext()
  const { suggestionId } = routeApi.useParams()
  const { user } = session
  const { data: suggestion } = useSuspenseQuery(suggestionQueryOptions(suggestionId))
  const reviewing =
    suggestion.status === "PENDING" && getPermissions(user)("mediaSuggestion.review")
  const [draft, setDraft] = useState(() =>
    toDraft({ ...suggestion.current, ...suggestion.changes }),
  )
  const [rejected, setRejected] = useState<MediaEditField[]>([])
  const [note, setNote] = useState("")
  const [noteRequired, setNoteRequired] = useState(false)
  const review = useReviewSuggestion(suggestionId)
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
      <SuggestionMeta suggestion={suggestion} />
      {suggestion.note === null ? null : (
        <SuggestionNote label={m.suggestion_note_from({ name: suggestion.author.displayUsername })}>
          {suggestion.note}
        </SuggestionNote>
      )}
      {suggestion.reviewerNote === null ? null : (
        <SuggestionNote label={m.suggestion_reviewer_note_label()}>
          {suggestion.reviewerNote}
        </SuggestionNote>
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
        <SuggestionReviewFooter
          acceptedCount={accepted.length}
          error={error}
          failure={review.isError ? getErrorMessage(review.error) : null}
          note={note}
          noteRequired={noteRequired}
          onAccept={() => {
            review.mutate(
              { accept: toChanges(draft, accepted), note: note.trim() },
              { onSuccess: done },
            )
          }}
          onNoteChange={setNote}
          onReject={() => {
            setNoteRequired(true)

            if (note.trim() !== "") {
              review.mutate({ accept: null, note: note.trim() }, { onSuccess: done })
            }
          }}
          pending={review.isPending}
          total={suggestion.fields.length}
        />
      ) : null}
    </DashboardPage>
  )
}
