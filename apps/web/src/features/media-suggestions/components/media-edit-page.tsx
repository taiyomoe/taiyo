import * as stylex from "@stylexjs/stylex"
import { MEDIA_EDIT_FIELDS, type MediaEditField } from "@taiyomoe/db/constants"
import { ArrowLeft, CheckCircle, Info } from "@taiyomoe/ui/components/icons"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import type { Session } from "@/lib/session"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { DashboardPage } from "@/components/layout/dashboard-page"
import {
  type MediaEditChanges,
  mediaEditQueryOptions,
  useInvalidateMedia,
} from "@/features/media-suggestions/api/media-suggestions"
import { FieldEditor } from "@/features/media-suggestions/components/media-edit-fields"
import {
  FIELD_LABELS,
  getFieldsError,
  sameField,
  toChanges,
  toDraft,
} from "@/features/media-suggestions/lib/media-edit-model"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const DETAIL_FIELDS = [
  "type",
  "status",
  "source",
  "demography",
  "countryOfOrigin",
  "contentRating",
  "startDate",
  "endDate",
] as const satisfies MediaEditField[]
const SECTIONS: Array<{ title: () => string; fields: readonly MediaEditField[] }> = [
  { title: m.media_edit_field_titles, fields: ["titles"] },
  { title: m.media_edit_field_synopsis, fields: ["synopsis"] },
  { title: m.media_edit_section_details, fields: DETAIL_FIELDS },
  { title: m.media_edit_field_tags, fields: ["tags"] },
  { title: m.media_info_links, fields: ["links"] },
  { title: m.media_edit_field_staffs, fields: ["staffs"] },
]
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
  sections: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  card: {
    padding: "1.5rem",
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1.25rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
  },
  details: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))",
  },
  footer: {
    padding: "0.75rem",
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    alignItems: "center",
    backdropFilter: "blur(12px)",
    backgroundColor: `color-mix(in srgb, ${colors.card} 92%, transparent)`,
    boxShadow: shadows.overlay,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingInlineStart: "1.25rem",
    position: "sticky",
    zIndex: 10,
    bottom: "1rem",
  },
  footerText: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  footerActions: {
    gap: "0.5rem",
    display: "flex",
    marginInlineStart: "auto",
  },
})

export function MediaEditPage({ mediaId, user }: { mediaId: string; user: Session["user"] }) {
  const { data } = useSuspenseQuery(mediaEditQueryOptions(mediaId))
  const { data: media } = useSuspenseQuery(mediaQueryOptions(mediaId))
  const direct = getPermissions(user)("media.update")
  const suggestion = direct ? null : data.suggestion
  const base = toDraft(data.current)
  const [draft, setDraft] = useState(() => toDraft({ ...data.current, ...suggestion?.changes }))
  const [note, setNote] = useState(suggestion?.note ?? "")
  const [sent, setSent] = useState(false)
  const invalidate = useInvalidateMedia()
  const save = useMutation({
    mutationFn: async ({ changes }: { changes: MediaEditChanges }) =>
      ensureSuccess(await api.medias[":id"].$patch({ param: { id: mediaId }, json: changes })),
    onSuccess: invalidate,
  })
  const suggest = useMutation({
    mutationFn: async ({
      suggestionId,
      changes,
      note: message,
    }: {
      suggestionId: string | null
      changes: MediaEditChanges
      note: string
    }) =>
      ensureSuccess(
        suggestionId === null
          ? await api.medias[":id"].suggestions.$post({
              param: { id: mediaId },
              json: { changes, note: message },
            })
          : await api["media-suggestions"][":id"].$patch({
              param: { id: suggestionId },
              json: { changes, note: message },
            }),
      ),
    onSuccess: invalidate,
  })
  const withdraw = useMutation({
    mutationFn: async (suggestionId: string) =>
      ensureSuccess(
        await api["media-suggestions"][":id"].withdraw.$post({ param: { id: suggestionId } }),
      ),
    onSuccess: invalidate,
  })
  const navigate = useNavigate()
  const mutation = direct ? save : suggest
  const changed = MEDIA_EDIT_FIELDS.filter((field) => !sameField(field, draft, base))
  const error = getFieldsError(draft, changed)
  const title = getMainTitle(media.titles) ?? m.media_untitled()

  if (sent) {
    return (
      <DashboardPage title={m.media_edit_suggest_title()}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckCircle />
            </EmptyMedia>
            <EmptyTitle>{m.media_edit_sent_title()}</EmptyTitle>
            <EmptyDescription>{m.media_edit_sent_description()}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              render={<Link params={{ mediaId }} search={{ tab: "info" }} to="/media/$mediaId" />}
            >
              {m.media_edit_back()}
            </Button>
            <Button render={<Link to="/dashboard/my-suggestions" />} variant="outline">
              {m.dashboard_nav_my_suggestions()}
            </Button>
          </EmptyContent>
        </Empty>
      </DashboardPage>
    )
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
        <Alert variant="info">
          <Info />
          <AlertTitle>{m.media_edit_pending_title()}</AlertTitle>
          <AlertDescription>{m.media_edit_pending_description()}</AlertDescription>
          <AlertAction>
            <Button
              disabled={withdraw.isPending}
              onClick={() => {
                withdraw.mutate(suggestion.id, {
                  onSuccess: () => {
                    void navigate({
                      to: "/media/$mediaId",
                      params: { mediaId },
                      search: { tab: "info" },
                    })
                  },
                })
              }}
              size="sm"
              variant="outline"
            >
              {m.submission_withdraw()}
            </Button>
          </AlertAction>
        </Alert>
      )}
      <ErrorAlert message={mutation.isError ? getErrorMessage(mutation.error) : null} />
      <div sx={styles.sections}>
        {SECTIONS.map((section) => (
          <section key={section.fields.join()} sx={styles.card}>
            <div sx={styles.cardHeader}>
              <h2 sx={styles.cardTitle}>{section.title()}</h2>
              {section.fields.some((field) => changed.includes(field)) ? (
                <Badge variant="info">{m.media_edit_changed()}</Badge>
              ) : null}
            </div>
            {section.fields.length === 1 ? (
              <FieldEditor
                draft={draft}
                field={section.fields[0] ?? "titles"}
                onChange={setDraft}
              />
            ) : (
              <div sx={styles.details}>
                {section.fields.map((field) => (
                  <Field key={field}>
                    <FieldLabel>{FIELD_LABELS[field]()}</FieldLabel>
                    <FieldEditor draft={draft} field={field} onChange={setDraft} />
                  </Field>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
      {direct ? null : (
        <section sx={styles.card}>
          <Field>
            <FieldLabel>{m.media_edit_note()}</FieldLabel>
            <Textarea
              maxLength={2000}
              onChange={(event) => {
                setNote(event.target.value)
              }}
              placeholder={m.media_edit_note_placeholder()}
              rows={3}
              value={note}
            />
            <FieldDescription>{m.media_edit_note_description()}</FieldDescription>
          </Field>
        </section>
      )}
      <div sx={styles.footer}>
        <span sx={styles.footerText}>
          {error ??
            (changed.length === 0
              ? m.media_edit_no_changes()
              : m.media_edit_changed_count({ count: changed.length }))}
        </span>
        <div sx={styles.footerActions}>
          <Button
            render={<Link params={{ mediaId }} search={{ tab: "info" }} to="/media/$mediaId" />}
            variant="outline"
          >
            {m.cancel()}
          </Button>
          <Button
            disabled={changed.length === 0 || error !== null || mutation.isPending}
            onClick={() => {
              const changes = toChanges(draft, changed)

              if (direct) {
                save.mutate(
                  { changes },
                  {
                    onSuccess: () => {
                      void navigate({
                        to: "/media/$mediaId",
                        params: { mediaId },
                        search: { tab: "info" },
                      })
                    },
                  },
                )
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
          >
            {direct ? m.media_edit_save() : m.media_edit_submit()}
          </Button>
        </div>
      </div>
    </DashboardPage>
  )
}
