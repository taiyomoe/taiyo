import * as stylex from "@stylexjs/stylex"
import { ArrowLeft } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"

const styles = stylex.create({
  back: {
    gap: "0.375rem",
    textDecoration: "none",
    alignItems: "center",
    color: {
      default: colors.mutedForeground,
      ":hover": colors.foreground,
    },
    display: "inline-flex",
  },
  icon: {
    height: "1rem",
    width: "1rem",
  },
})

export function BackLink({
  to,
  label,
}: {
  to: "/dashboard/medias" | "/dashboard/covers" | "/dashboard/banners"
  label: string
}) {
  return (
    <Link to={to} {...stylex.props(styles.back)}>
      <ArrowLeft {...stylex.props(styles.icon)} />
      {label}
    </Link>
  )
}
