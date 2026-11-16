import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  footer: {
    padding: "0.75rem",
    borderColor: colors.border,
    borderRadius: {
      default: "calc(1.125rem + 0.75rem + 1px)",
      [breakpoints.sm]: "calc(1rem + 0.75rem + 1px)",
    },
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
  text: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: { default: "row", [breakpoints.maxSm]: "column-reverse" },
    marginInlineStart: "auto",
    width: { default: null, [breakpoints.maxSm]: "100%" },
  },
})

export function NewMediaFooter({
  error,
  pending,
  onSubmit,
}: {
  error: string | null
  pending: boolean
  onSubmit: () => void
}) {
  return (
    <div sx={styles.footer}>
      <span sx={styles.text}>{error ?? m.catalog_media_new_ready()}</span>
      <div sx={styles.actions}>
        <Button render={<Link to="/dashboard/medias" />} variant="outline">
          {m.cancel()}
        </Button>
        <Button disabled={error !== null} loading={pending} onClick={onSubmit}>
          {m.catalog_media_new_submit()}
        </Button>
      </div>
    </div>
  )
}
