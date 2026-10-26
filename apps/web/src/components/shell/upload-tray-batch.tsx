import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { LanguageFlag } from "@/components/flags/flags"
import { UploadTrayJob } from "@/components/shell/upload-tray-job"
import { summarize, uploadStore } from "@/features/uploads/lib/chapter-batch/upload-store"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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
})

type UploadTrayBatchProps = {
  batch: ReturnType<typeof uploadStore.getSnapshot>[number]
}

export function UploadTrayBatch({ batch }: UploadTrayBatchProps) {
  const batchSummary = summarize(batch.jobs)
  const batchActive = batchSummary.queued + batchSummary.uploading > 0

  return (
    <section sx={styles.batch}>
      <div sx={styles.batchHeader}>
        <LanguageFlag language={batch.language} />
        <span sx={styles.batchTitle} title={batch.mediaTitle}>
          {batch.mediaTitle}
        </span>
        {batchSummary.failed + batchSummary.cancelled > 0 && !batchActive ? (
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
        {batchActive ? (
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
        {batchSummary.busy ? null : (
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
          <UploadTrayJob job={job} key={job.key} />
        ))}
      </ul>
    </section>
  )
}
