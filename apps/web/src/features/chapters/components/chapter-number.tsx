import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  number: {
    color: colors.primary,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
})

export function ChapterNumber({ number, sx }: { number: number; sx?: Sx }) {
  return <span sx={[styles.number, sx]}>{m.chapter_number({ number })}</span>
}
