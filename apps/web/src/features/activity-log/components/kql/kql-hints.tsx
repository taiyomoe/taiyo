import * as stylex from "@stylexjs/stylex"
import { Kbd } from "@taiyomoe/ui/components/ui/kbd"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  footer: {
    gap: "1rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.75rem",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    marginTop: "0.375rem",
    paddingBottom: "0.125rem",
    paddingTop: "0.5rem",
  },
  hint: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
  },
})

export function KqlHints() {
  return (
    <div sx={styles.footer}>
      <span sx={styles.hint}>
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
        {m.activity_hint_navigate()}
      </span>
      <span sx={styles.hint}>
        <Kbd>Tab</Kbd>
        {m.activity_hint_complete()}
      </span>
      <span sx={styles.hint}>
        <Kbd>Enter</Kbd>
        {m.activity_hint_search()}
      </span>
    </div>
  )
}
