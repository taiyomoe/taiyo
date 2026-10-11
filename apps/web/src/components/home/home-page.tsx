import * as stylex from "@stylexjs/stylex"
import { colors, font, text } from "@taiyomoe/ui/styles/tokens.stylex"

import { AppShell } from "@/components/shell/app-shell"
import type { Session } from "@/lib/queries/session"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    paddingBlock: "2rem",
    paddingInline: {
      default: "1.25rem",
      "@media (width >= 48rem)": "2rem",
    },
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: text.xxxl,
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
})

export function HomePage({ user }: { user: Session["user"] }) {
  return (
    <AppShell user={user}>
      <div sx={styles.page}>
        <h1 sx={styles.heading}>{m.home_greeting({ name: user.name })}</h1>
      </div>
    </AppShell>
  )
}
