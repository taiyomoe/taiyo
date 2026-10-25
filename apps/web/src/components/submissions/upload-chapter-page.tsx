import type { Language } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { CheckCircle, Clock, Info } from "@taiyomoe/ui/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Progress } from "@taiyomoe/ui/components/ui/progress"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import type { Session } from "@/lib/queries/session"
import { AuthAlert } from "@/components/auth/auth-alert"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { type PageFile, PageFiles } from "@/components/submissions/page-files"
import {
  type GroupOption,
  GroupPicker,
  LanguagePicker,
  type MediaOption,
  MediaPicker,
} from "@/components/submissions/pickers"
import { getErrorMessage } from "@/lib/errors"
import { usePermissions } from "@/lib/permissions"
import { type UploadProgress, uploadChapter } from "@/lib/queries/submissions"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  layout: {
    gap: "1.5rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (width >= 64rem)": "24rem minmax(0, 1fr)",
    },
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
    minWidth: 0,
  },
  cardTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
  },
  row: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },
  footer: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  progress: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: "12rem",
  },
  progressLabel: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  done: {
    gap: "1rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  doneActions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
})

type Status =
  | { kind: "idle" }
  | { kind: "uploading"; progress: UploadProgress }
  | { kind: "done"; published: boolean }
  | { kind: "error"; message: string }

const progressLabel = (progress: UploadProgress) => {
  if (progress.step === "creating") {
    return m.upload_progress_creating()
  }

  if (progress.step === "uploading") {
    return m.upload_progress_uploading({ done: progress.done, total: progress.total })
  }

  return m.upload_progress_processing()
}
const progressValue = (progress: UploadProgress) => {
  if (progress.step === "creating") {
    return 5
  }

  return progress.step === "uploading"
    ? 5 + Math.round((progress.done / Math.max(progress.total, 1)) * 85)
    : 95
}

export function UploadChapterPage({ user }: { user: Session["user"] }) {
  const can = usePermissions(user)
  const queryClient = useQueryClient()
  const [media, setMedia] = useState<MediaOption | null>(null)
  const [number, setNumber] = useState("")
  const [volume, setVolume] = useState("")
  const [title, setTitle] = useState("")
  const [language, setLanguage] = useState<Language>("en")
  const [groups, setGroups] = useState<GroupOption[]>([])
  const [pages, setPages] = useState<PageFile[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const busy = status.kind === "uploading"
  const parsedNumber = Number(number)
  const numberInvalid = number.trim() === "" || !Number.isFinite(parsedNumber) || parsedNumber < 0
  const publishes =
    can("chapter.publish") || groups.some((group) => can("group.uploadChapters", { id: group.id }))
  const reset = () => {
    for (const page of pages) {
      URL.revokeObjectURL(page.url)
    }

    setNumber("")
    setTitle("")
    setPages([])
    setSubmitted(false)
    setStatus({ kind: "idle" })
  }

  if (status.kind === "done") {
    return (
      <DashboardPage subtitle={m.upload_subtitle()} title={m.upload_title()}>
        <div sx={styles.card}>
          <div sx={styles.done}>
            <Alert variant={status.published ? "success" : "info"}>
              {status.published ? <CheckCircle /> : <Clock />}
              <AlertTitle>
                {status.published ? m.upload_done_published() : m.upload_done_review()}
              </AlertTitle>
              <AlertDescription>
                {status.published
                  ? m.upload_done_published_description()
                  : m.upload_done_review_description()}
              </AlertDescription>
            </Alert>
            <div sx={styles.doneActions}>
              <Button onClick={reset}>{m.upload_another()}</Button>
              <Button render={<Link to="/dashboard/submissions" />} variant="outline">
                {m.dashboard_nav_submissions()}
              </Button>
            </div>
          </div>
        </div>
      </DashboardPage>
    )
  }

  return (
    <DashboardPage subtitle={m.upload_subtitle()} title={m.upload_title()}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)

          if (media === null || numberInvalid || pages.length === 0) {
            return
          }

          setStatus({ kind: "uploading", progress: { step: "creating" } })
          void uploadChapter(
            {
              mediaId: media.id,
              details: {
                number: parsedNumber,
                language,
                title: title.trim() === "" ? null : title.trim(),
                volume: volume.trim() === "" ? null : volume.trim(),
              },
              groupIds: groups.map((group) => group.id),
              pages: pages.map((page) => page.file),
            },
            (progress) => {
              setStatus({ kind: "uploading", progress })
            },
          )
            .then(async (created) => {
              await queryClient.invalidateQueries({ queryKey: ["chapter-review"] })
              setStatus({ kind: "done", published: created.status === "PUBLISHED" })
            })
            .catch((error: unknown) => {
              setStatus({ kind: "error", message: getErrorMessage(error) })
            })
        }}
      >
        <div sx={styles.layout}>
          <div sx={styles.card}>
            <h2 sx={styles.cardTitle}>{m.upload_details()}</h2>
            <Field invalid={submitted && media === null}>
              <FieldLabel>{m.upload_media()}</FieldLabel>
              <MediaPicker
                invalid={submitted && media === null}
                onChange={setMedia}
                value={media}
              />
              {submitted && media === null ? (
                <FieldError match>{m.upload_media_required()}</FieldError>
              ) : null}
            </Field>
            <div sx={styles.row}>
              <Field invalid={submitted && numberInvalid}>
                <FieldLabel>{m.upload_number()}</FieldLabel>
                <Input
                  disabled={busy}
                  inputMode="decimal"
                  onChange={(event) => {
                    setNumber(event.target.value)
                  }}
                  placeholder="12"
                  value={number}
                />
                {submitted && numberInvalid ? (
                  <FieldError match>{m.upload_number_required()}</FieldError>
                ) : null}
              </Field>
              <Field>
                <FieldLabel>{m.upload_volume()}</FieldLabel>
                <Input
                  disabled={busy}
                  onChange={(event) => {
                    setVolume(event.target.value)
                  }}
                  placeholder="2"
                  value={volume}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>{m.upload_chapter_title()}</FieldLabel>
              <Input
                disabled={busy}
                onChange={(event) => {
                  setTitle(event.target.value)
                }}
                value={title}
              />
            </Field>
            <Field>
              <FieldLabel>{m.upload_language()}</FieldLabel>
              <LanguagePicker onChange={setLanguage} value={language} />
            </Field>
            <Field>
              <FieldLabel>{m.upload_groups()}</FieldLabel>
              <GroupPicker can={can} onChange={setGroups} value={groups} />
              <FieldDescription>{m.upload_groups_description()}</FieldDescription>
            </Field>
          </div>
          <div sx={styles.card}>
            <h2 sx={styles.cardTitle}>{m.upload_pages()}</h2>
            <PageFiles disabled={busy} onChange={setPages} value={pages} />
            {submitted && pages.length === 0 ? (
              <AuthAlert message={m.upload_pages_required()} />
            ) : null}
            <Alert variant={publishes ? "success" : "info"}>
              {publishes ? <CheckCircle /> : <Info />}
              <AlertTitle>
                {publishes ? m.upload_will_publish() : m.upload_will_review()}
              </AlertTitle>
              <AlertDescription>
                {publishes
                  ? m.upload_will_publish_description()
                  : m.upload_will_review_description()}
              </AlertDescription>
            </Alert>
            {status.kind === "error" ? <AuthAlert message={status.message} /> : null}
            <div sx={styles.footer}>
              {status.kind === "uploading" ? (
                <div sx={styles.progress}>
                  <span sx={styles.progressLabel}>{progressLabel(status.progress)}</span>
                  <Progress value={progressValue(status.progress)} />
                </div>
              ) : (
                <span />
              )}
              <Button disabled={busy} type="submit">
                {publishes ? m.upload_submit_publish() : m.upload_submit_review()}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </DashboardPage>
  )
}
