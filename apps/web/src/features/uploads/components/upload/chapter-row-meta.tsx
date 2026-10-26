import * as stylex from "@stylexjs/stylex"
import { CalendarClock, Link as LinkIcon } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ChapterSource } from "@/features/uploads/lib/chapter-batch/sources"
import type { RowIssues } from "@/features/uploads/lib/chapter-batch/upload-rows"
import { formatDateTime } from "@/components/fields/date-time-picker"
import { hostOf, isWebUrl } from "@/features/uploads/lib/chapter-batch/links"
import { m } from "@/paraglide/messages"

type ChapterRowMetaProps = {
  source: ChapterSource | null
  link: string | null
  linkVisible: boolean
  releaseAt: Date | null
  issues: RowIssues
  attempted: boolean
}

const styles = stylex.create({
  rowMeta: {
    gap: "0.75rem",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  source: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "24rem",
  },
  metaItem: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
    minWidth: 0,
  },
  metaIcon: {
    flexShrink: 0,
  },
  warning: {
    color: colors.warning,
  },
  error: {
    color: colors.destructive,
  },
})

export function ChapterRowMeta({
  source,
  link,
  linkVisible,
  releaseAt,
  issues,
  attempted,
}: ChapterRowMetaProps) {
  return (
    <div sx={styles.rowMeta}>
      <span sx={styles.source} title={source?.name}>
        {source === null ? m.upload_link_only_source() : source.name || "—"}
      </span>
      {link !== null && !linkVisible && isWebUrl(link) ? (
        <span sx={[styles.metaItem, styles.source]} title={link}>
          <LinkIcon size={12} {...stylex.props(styles.metaIcon)} />
          {hostOf(link)}
        </span>
      ) : null}
      {releaseAt === null ? null : (
        <span sx={styles.metaItem}>
          <CalendarClock size={12} {...stylex.props(styles.metaIcon)} />
          {m.chapter_goes_live({ time: formatDateTime(releaseAt) })}
        </span>
      )}
      {issues.warnings.map((warning) => (
        <span key={warning} sx={styles.warning}>
          {warning}
        </span>
      ))}
      {attempted
        ? issues.errors.map((error) => (
            <span key={error} sx={styles.error}>
              {error}
            </span>
          ))
        : null}
    </div>
  )
}
