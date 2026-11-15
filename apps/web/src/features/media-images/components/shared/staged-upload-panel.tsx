import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { CloudUpload } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Progress } from "@taiyomoe/ui/components/ui/progress"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  panel: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "0.75rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    display: "flex",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  title: {
    margin: 0,
    flexGrow: 1,
    fontSize: "1rem",
    fontWeight: 600,
  },
  count: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  rows: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  footer: {
    gap: "0.75rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.muted} 72%, transparent)`,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  progress: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexGrow: 1,
    fontSize: "0.8125rem",
    minWidth: "12rem",
  },
  error: {
    paddingInline: "1.25rem",
    paddingBottom: 0,
    paddingTop: "1rem",
  },
})

export function StagedUploadPanel({
  title,
  count,
  uploading,
  progress,
  error,
  blocked,
  onClear,
  onUpload,
  children,
}: {
  title: string
  count: number
  uploading: boolean
  progress: number
  error: string | null
  blocked: boolean
  onClear: () => void
  onUpload: () => void
  children: ReactNode
}) {
  return (
    <section sx={styles.panel}>
      <header sx={styles.header}>
        <h2 sx={styles.title}>{title}</h2>
        <span sx={styles.count}>{count}</span>
      </header>
      {error === null ? null : (
        <div sx={styles.error}>
          <ErrorAlert message={error} />
        </div>
      )}
      <ul sx={styles.rows}>{children}</ul>
      <footer sx={styles.footer}>
        {uploading ? (
          <div sx={styles.progress}>
            <Progress value={(progress / count) * 100} />
            {m.media_images_uploading({ done: progress, count })}
          </div>
        ) : null}
        <Button disabled={uploading} onClick={onClear} variant="ghost">
          {m.media_images_clear()}
        </Button>
        <Button disabled={blocked} loading={uploading} onClick={onUpload}>
          <CloudUpload />
          {m.media_images_upload({ count })}
        </Button>
      </footer>
    </section>
  )
}
