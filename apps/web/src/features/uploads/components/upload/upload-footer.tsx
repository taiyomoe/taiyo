import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Upload } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UploadRow } from "@/features/uploads/lib/chapter-batch/upload-rows"
import { m } from "@/paraglide/messages"

type UploadFooterProps = {
  rows: UploadRow[]
  overCap: boolean
  attempted: boolean
  blocked: boolean
  reading: boolean
  onStart: () => void
}

const styles = stylex.create({
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
  footerError: {
    color: colors.destructive,
    fontSize: "0.875rem",
  },
})

export function UploadFooter({
  rows,
  overCap,
  attempted,
  blocked,
  reading,
  onStart,
}: UploadFooterProps) {
  let footerStatus = (
    <span sx={styles.footerText}>
      {m.upload_total_pages({ count: rows.reduce((sum, row) => sum + row.pageKeys.length, 0) })}
    </span>
  )

  if (overCap) {
    footerStatus = (
      <span sx={styles.footerError}>
        {m.upload_over_cap({ max: config.input.maxPendingChapters })}
      </span>
    )
  } else if (attempted && blocked) {
    footerStatus = <span sx={styles.footerError}>{m.upload_fix_first()}</span>
  }

  return (
    <div sx={styles.footer}>
      {footerStatus}
      <Button disabled={reading} onClick={onStart}>
        <Upload />
        {m.upload_start({ count: rows.length })}
      </Button>
    </div>
  )
}
