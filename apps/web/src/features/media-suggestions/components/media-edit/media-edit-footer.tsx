import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { m } from "@/paraglide/messages"

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
  footerActions: {
    gap: "0.5rem",
    display: "flex",
    marginInlineStart: "auto",
  },
})

type MediaEditFooterProps = {
  mediaId: string
  direct: boolean
  error: string | null
  changedCount: number
  pending: boolean
  onSubmit: () => void
}

export function MediaEditFooter({
  mediaId,
  direct,
  error,
  changedCount,
  pending,
  onSubmit,
}: MediaEditFooterProps) {
  return (
    <div sx={styles.footer}>
      <span sx={styles.footerText}>
        {error ??
          (changedCount === 0
            ? m.media_edit_no_changes()
            : m.media_edit_changed_count({ count: changedCount }))}
      </span>
      <div sx={styles.footerActions}>
        <Button
          render={<Link params={{ mediaId }} search={{ tab: "info" }} to="/media/$mediaId" />}
          variant="outline"
        >
          {m.cancel()}
        </Button>
        <Button disabled={changedCount === 0 || error !== null || pending} onClick={onSubmit}>
          {direct ? m.media_edit_save() : m.media_edit_submit()}
        </Button>
      </div>
    </div>
  )
}
