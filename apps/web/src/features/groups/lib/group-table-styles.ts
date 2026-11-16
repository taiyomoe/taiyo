import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

/** The text that rows of the group tables quote, clamped to two lines. */
export const groupTableStyles = stylex.create({
  /** One permission pill and the count of the others side by side, in every language. */
  colPermissions: {
    width: "15rem",
  },
  excerpt: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
  empty: {
    fontStyle: "italic",
  },
  note: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.8125rem",
    fontStyle: "italic",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
  textButton: {
    font: "inherit",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    textAlign: "start",
    maxWidth: "100%",
  },
})
