import * as stylex from "@stylexjs/stylex"
import { Eye } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { sessionQueryOptions } from "@/lib/queries/session"
import { useStopImpersonating } from "@/lib/queries/user-admin"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  bar: {
    padding: "0.375rem",
    borderColor: `color-mix(in srgb, ${colors.warning} 45%, ${colors.border})`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.625rem",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.warning} 14%, ${colors.popover})`,
    boxShadow: shadows.overlay,
    color: colors.foreground,
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    paddingInlineStart: "0.875rem",
    position: "fixed",
    zIndex: 45,
    bottom: "1rem",
    left: "1rem",
    maxWidth: "calc(100vw - 2rem)",
  },
  icon: {
    color: colors.warning,
    flexShrink: 0,
  },
  name: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function ImpersonationBar() {
  const { data } = useQuery(sessionQueryOptions)
  const stop = useStopImpersonating()

  if (typeof data?.session.impersonatedBy !== "string") {
    return null
  }

  return (
    <div role="status" sx={styles.bar}>
      <Eye size={16} {...stylex.props(styles.icon)} />
      <span sx={styles.name}>
        {m.impersonation_active({ name: data.user.displayUsername ?? data.user.name })}
      </span>
      <Button
        disabled={stop.isPending}
        onClick={() => {
          stop.mutate()
        }}
        size="xs"
        variant="outline"
      >
        {m.impersonation_stop()}
      </Button>
    </div>
  )
}
