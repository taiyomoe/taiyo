import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type {
  JobOutcome,
  JobState,
  UploadJob,
} from "@/features/uploads/lib/chapter-batch/upload-store"
import { ChapterNumber } from "@/features/chapters/components/chapter-number"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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

type UploadTrayJobProps = {
  job: UploadJob
}

export function UploadTrayJob({ job }: UploadTrayJobProps) {
  const { state } = job
  let label: string

  if (state.kind === "uploading") {
    label = m.uploads_state_uploading({
      done: state.done,
      total: state.total,
    })
  } else if (state.kind === "done") {
    label = OUTCOME_LABELS[state.outcome]()
  } else {
    label = SIMPLE_LABELS[state.kind]()
  }

  return (
    <li sx={styles.job} title={state.kind === "failed" ? state.message : undefined}>
      <ChapterNumber number={job.number} />
      <span sx={styles.jobTitle}>{job.title ?? ""}</span>
      <span sx={[styles.jobState, STATE_STYLES[state.kind]]}>{label}</span>
    </li>
  )
}
