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
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { summarize } from "@/features/uploads/lib/chapter-batch/upload-store"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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
})

export function UploadTrayHeader({
  summary,
  open,
  onToggle,
  onDismiss,
}: {
  summary: ReturnType<typeof summarize>
  open: boolean
  onToggle: () => void
  onDismiss: () => void
}) {
  return (
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
        onClick={onToggle}
        size="icon-sm"
        variant="ghost"
      >
        {open ? <ChevronDown /> : <ChevronUp />}
      </Button>
      {summary.busy ? null : (
        <Button aria-label={m.uploads_dismiss()} onClick={onDismiss} size="icon-sm" variant="ghost">
          <Close />
        </Button>
      )}
    </div>
  )
}
