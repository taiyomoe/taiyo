import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const AVATAR_SIZE = "4.25rem"

export const hoverCardStyles = stylex.create({
  banner: {
    overflow: "hidden",
    backgroundColor: colors.muted,
    position: "relative",
    height: "6rem",
    width: "100%",
  },
  body: {
    gap: "0.625rem",
    paddingInline: "1rem",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "1rem",
  },
  avatarRow: {
    gap: "0.75rem",
    alignItems: "flex-end",
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
    marginTop: `calc(${AVATAR_SIZE} / -2)`,
  },
  avatar: {
    borderColor: colors.popover,
    borderStyle: "solid",
    borderWidth: 3,
    flexShrink: 0,
    height: AVATAR_SIZE,
    width: AVATAR_SIZE,
  },
})
