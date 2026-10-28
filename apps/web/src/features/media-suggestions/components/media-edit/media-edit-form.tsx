import * as stylex from "@stylexjs/stylex"
import { MEDIA_EDIT_FIELDS } from "@taiyomoe/db/constants"
import { ArrowLeft } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import type { Session } from "@/lib/session"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { DashboardPage } from "@/components/layout/dashboard-page"
import {
  mediaEditQueryOptions,
  useMediaEditMutations,
} from "@/features/media-suggestions/api/media-suggestions"
import { MediaEditFooter } from "@/features/media-suggestions/components/media-edit/media-edit-footer"
import { MediaEditNote } from "@/features/media-suggestions/components/media-edit/media-edit-note"
import { MediaEditPendingAlert } from "@/features/media-suggestions/components/media-edit/media-edit-pending-alert"
import { MediaEditSections } from "@/features/media-suggestions/components/media-edit/media-edit-sections"
import { MediaEditSent } from "@/features/media-suggestions/components/media-edit/media-edit-sent"
import {
  getFieldsError,
  sameField,
  toChanges,
  toDraft,
} from "@/features/media-suggestions/lib/media-edit-model"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
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
  backIcon: {
    height: "1rem",
    width: "1rem",
  },
})

export function MediaEditForm({ mediaId, user }: { mediaId: string; user: Session["user"] }) {
  const { data } = useSuspenseQuery(mediaEditQueryOptions(mediaId))
  const { data: media } = useSuspenseQuery(mediaQueryOptions(mediaId))
  const direct = getPermissions(user)("media.update")
  const suggestion = direct ? null : data.suggestion
  const base = toDraft(data.current)
  const [draft, setDraft] = useState(() => toDraft({ ...data.current, ...suggestion?.changes }))
  const [note, setNote] = useState(suggestion?.note ?? "")
  const [sent, setSent] = useState(false)
  const { save, suggest, withdraw } = useMediaEditMutations(mediaId)
  const navigate = useNavigate()
  const mutation = direct ? save : suggest
  const changed = MEDIA_EDIT_FIELDS.filter((field) => !sameField(field, draft, base))
  const error = getFieldsError(draft, changed)
  const title = getMainTitle(media.titles) ?? m.media_untitled()
  const backToMedia = () => {
    void navigate({ to: "/media/$mediaId", params: { mediaId }, search: { tab: "info" } })
  }

  if (sent) {
    return <MediaEditSent mediaId={mediaId} />
  }

  return (
    <DashboardPage
      eyebrow={
        <Link
          params={{ mediaId }}
          search={{ tab: "info" }}
          to="/media/$mediaId"
          {...stylex.props(styles.back)}
        >
          <ArrowLeft {...stylex.props(styles.backIcon)} />
          {title}
        </Link>
      }
      subtitle={direct ? m.media_edit_direct_subtitle() : m.media_edit_suggest_subtitle()}
      title={direct ? m.media_edit_direct_title() : m.media_edit_suggest_title()}
    >
      {suggestion === null ? null : (
        <MediaEditPendingAlert
          onWithdraw={() => {
            withdraw.mutate(suggestion.id, { onSuccess: backToMedia })
          }}
          withdrawing={withdraw.isPending}
        />
      )}
      <ErrorAlert message={mutation.isError ? getErrorMessage(mutation.error) : null} />
      <MediaEditSections changed={changed} draft={draft} onChange={setDraft} />
      {direct ? null : <MediaEditNote onChange={setNote} value={note} />}
      <MediaEditFooter
        changedCount={changed.length}
        direct={direct}
        error={error}
        mediaId={mediaId}
        onSubmit={() => {
          const changes = toChanges(draft, changed)

          if (direct) {
            save.mutate({ changes }, { onSuccess: backToMedia })
          } else {
            suggest.mutate(
              { suggestionId: suggestion?.id ?? null, changes, note: note.trim() },
              {
                onSuccess: () => {
                  setSent(true)
                },
              },
            )
          }
        }}
        pending={mutation.isPending}
      />
    </DashboardPage>
  )
}
