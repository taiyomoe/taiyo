import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  note: {
    margin: 0,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    backgroundColor: colors.card,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  noteLabel: {
    color: colors.mutedForeground,
    display: "block",
    fontSize: "0.8125rem",
    marginBottom: "0.375rem",
  },
})

type SuggestionNoteProps = {
  label: string
  children: ReactNode
}

export function SuggestionNote({ label, children }: SuggestionNoteProps) {
  return (
    <p sx={styles.note}>
      <span sx={styles.noteLabel}>{label}</span>
      {children}
    </p>
  )
}
