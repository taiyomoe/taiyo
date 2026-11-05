import type { IconProps } from "@taiyomoe/ui/components/icons"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  option: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  icon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  label: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function RoleOption({
  icon: Icon,
  label,
}: {
  icon: (props: IconProps) => React.ReactElement
  label: string
}) {
  return (
    <span sx={styles.option}>
      <Icon size={16} {...stylex.props(styles.icon)} />
      <span sx={styles.label}>{label}</span>
    </span>
  )
}
