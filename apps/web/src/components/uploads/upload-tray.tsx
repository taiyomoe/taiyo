import * as stylex from "@stylexjs/stylex"
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Close,
  CloudUpload,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Progress } from "@taiyomoe/ui/components/ui/progress"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useSyncExternalStore } from "react"
import { ChapterNumber } from "@/components/chapters/chapter-meta"
import { LanguageFlag } from "@/components/chapters/flags"
import {
  type JobOutcome,
  type JobState,
  jobProgress,
  summarize,
  type UploadBatch,
  uploadStore,
} from "@/lib/chapter-batch/upload-store"
import { m } from "@/paraglide/messages"

let expanded = false
const expandedListeners = new Set<() => void>()
const expandedStore = {
  subscribe: (listener: () => void) => {
    expandedListeners.add(listener)

    return () => {
      expandedListeners.delete(listener)
    }
  },
  get: () => expanded,
  toggle: () => {
    expanded = !expanded

    for (const listener of expandedListeners) {
      listener()
    }
  },
}
const styles = stylex.create({
  tray: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    zIndex: 40,
    bottom: "1rem",
    right: "1rem",
    width: "min(26rem, calc(100vw - 2rem))",
  },
  header: {
    gap: "0.75rem",
    paddingBlock: "0.875rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
  },
  headerIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  headerIconDone: {
    color: colors.success,
  },
  headerText: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: "0.9375rem",
    fontWeight: 600,
  },
  headerMeta: {
    gap: "0.625rem",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
  },
  failed: {
    color: colors.destructive,
  },
  progress: {
    paddingInline: "1rem",
    paddingBottom: "0.875rem",
  },
  body: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    maxHeight: "min(26rem, 55vh)",
    overflowY: "auto",
  },
  batch: {
    paddingBlock: "0.75rem",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: { default: 1, ":first-child": 0 },
  },
  batchHeader: {
    gap: "0.5rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    marginBottom: "0.375rem",
  },
  batchTitle: {
    overflow: "hidden",
    flexGrow: 1,
    fontSize: "0.875rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  jobs: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  job: {
    gap: "0.625rem",
    paddingBlock: "0.3125rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.8125rem",
  },
  jobTitle: {
    overflow: "hidden",
    color: colors.mutedForeground,
    flexGrow: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  jobState: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
  },
  jobStateDone: {
    color: colors.success,
  },
  jobStateFailed: {
    color: colors.destructive,
  },
})
const STATE_STYLES: Partial<Record<JobState["kind"], stylex.StyleXStyles>> = {
  done: styles.jobStateDone,
  failed: styles.jobStateFailed,
}
const SIMPLE_LABELS: Record<Exclude<JobState["kind"], "uploading" | "done">, () => string> = {
  queued: m.uploads_state_queued,
  processing: m.uploads_state_processing,
  failed: m.uploads_state_failed,
  cancelled: m.uploads_state_cancelled,
}
const OUTCOME_LABELS: Record<JobOutcome, () => string> = {
  published: m.uploads_state_published,
  scheduled: m.uploads_state_scheduled,
  review: m.uploads_state_review,
}
const stateLabel = (state: JobState) => {
  if (state.kind === "uploading") {
    return m.uploads_state_uploading({ done: state.done, total: state.total })
  }

  if (state.kind === "done") {
    return OUTCOME_LABELS[state.outcome]()
  }

  return SIMPLE_LABELS[state.kind]()
}

function BatchSection({ batch }: { batch: UploadBatch }) {
  const summary = summarize(batch.jobs)
  const active = summary.queued + summary.uploading > 0

  return (
    <section sx={styles.batch}>
      <div sx={styles.batchHeader}>
        <LanguageFlag language={batch.language} />
        <span sx={styles.batchTitle} title={batch.mediaTitle}>
          {batch.mediaTitle}
        </span>
        {summary.failed + summary.cancelled > 0 && !active ? (
          <Button
            onClick={() => {
              uploadStore.retry(batch.id)
            }}
            size="xs"
            variant="outline"
          >
            {m.uploads_retry()}
          </Button>
        ) : null}
        {active ? (
          <Button
            onClick={() => {
              uploadStore.cancel(batch.id)
            }}
            size="xs"
            variant="ghost"
          >
            {m.uploads_cancel()}
          </Button>
        ) : null}
        {summary.busy ? null : (
          <Button
            onClick={() => {
              uploadStore.dismiss(batch.id)
            }}
            size="xs"
            variant="ghost"
          >
            {m.uploads_dismiss()}
          </Button>
        )}
      </div>
      <ul sx={styles.jobs}>
        {batch.jobs.map((job) => (
          <li
            key={job.key}
            sx={styles.job}
            title={job.state.kind === "failed" ? job.state.message : undefined}
          >
            <ChapterNumber number={job.number} />
            <span sx={styles.jobTitle}>{job.title ?? ""}</span>
            <span sx={[styles.jobState, STATE_STYLES[job.state.kind]]}>
              {stateLabel(job.state)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function UploadTray() {
  const batches = useSyncExternalStore(
    uploadStore.subscribe,
    uploadStore.getSnapshot,
    uploadStore.getServerSnapshot,
  )
  const open = useSyncExternalStore(expandedStore.subscribe, expandedStore.get, () => false)
  const queryClient = useQueryClient()

  useEffect(() => {
    uploadStore.connect(queryClient)
  }, [queryClient])

  if (batches.length === 0) {
    return null
  }

  const jobs = batches.flatMap((batch) => batch.jobs)
  const summary = summarize(jobs)
  const progress =
    (jobs.reduce((sum, job) => sum + jobProgress(job.state), 0) / Math.max(jobs.length, 1)) * 100

  return (
    <aside aria-label={m.uploads_title_active()} sx={styles.tray}>
      <div sx={styles.header}>
        {summary.busy ? (
          <CloudUpload {...stylex.props(styles.headerIcon)} />
        ) : (
          <CheckCircle {...stylex.props(styles.headerIcon, styles.headerIconDone)} />
        )}
        <div sx={styles.headerText}>
          <span sx={styles.headerTitle}>
            {summary.busy ? m.uploads_title_active() : m.uploads_title_done()}
          </span>
          <span sx={styles.headerMeta}>
            <span>{m.uploads_progress({ done: summary.done, total: summary.total })}</span>
            {summary.failed > 0 ? (
              <span sx={styles.failed}>
                <AlertCircle size={12} /> {m.uploads_failed({ count: summary.failed })}
              </span>
            ) : null}
          </span>
        </div>
        <Button
          aria-expanded={open}
          aria-label={open ? m.uploads_collapse() : m.uploads_expand()}
          onClick={expandedStore.toggle}
          size="icon-sm"
          variant="ghost"
        >
          {open ? <ChevronDown /> : <ChevronUp />}
        </Button>
        {summary.busy ? null : (
          <Button
            aria-label={m.uploads_dismiss()}
            onClick={() => {
              for (const batch of batches) {
                uploadStore.dismiss(batch.id)
              }
            }}
            size="icon-sm"
            variant="ghost"
          >
            <Close />
          </Button>
        )}
      </div>
      {summary.busy ? (
        <div sx={styles.progress}>
          <Progress value={Math.round(progress)} />
        </div>
      ) : null}
      {open ? (
        <div sx={styles.body}>
          {batches.map((batch) => (
            <BatchSection batch={batch} key={batch.id} />
          ))}
        </div>
      ) : null}
    </aside>
  )
}
