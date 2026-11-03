import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

export const paletteRowStyles = stylex.create({
  media: {
    borderRadius: `calc(${radius.xl} - 1rem - 1px)`,
  },
  text: {
    flex: "1",
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  primary: {
    overflow: "hidden",
    color: colors.foreground,
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  secondary: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.4,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  clamp: {
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    whiteSpace: "normal",
  },
  trailing: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
    fontSize: "0.75rem",
    marginLeft: "auto",
  },
})
