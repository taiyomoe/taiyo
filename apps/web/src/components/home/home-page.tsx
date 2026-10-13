import * as stylex from "@stylexjs/stylex"
import { colors, font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { range } from "remeda"
import type { Session } from "@/lib/queries/session"
import { AppShell } from "@/components/shell/app-shell"
import { m } from "@/paraglide/messages"

const PLACEHOLDERS = range(0, 6)
const styles = stylex.create({
  page: {
    gap: "3rem",
    paddingBlock: "2rem",
    paddingInline: {
      default: "1.25rem",
      "@media (width >= 48rem)": "2rem",
    },
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: text.xxxl,
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  shelf: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  shelfTitle: {
    borderRadius: radius.full,
    backgroundColor: colors.well,
    height: "1.25rem",
    width: "12rem",
  },
  covers: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(9rem, 1fr))",
  },
  cover: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    aspectRatio: "2 / 3",
    backgroundColor: colors.card,
  },
})

export function HomePage({ user }: { user: Session["user"] }) {
  return (
    <AppShell user={user}>
      <div sx={styles.page}>
        <h1 sx={styles.heading}>{m.home_greeting({ name: user.name })}</h1>
        {PLACEHOLDERS.map((shelf) => (
          <section key={shelf} sx={styles.shelf}>
            <div sx={styles.shelfTitle} />
            <div sx={styles.covers}>
              {PLACEHOLDERS.map((cover) => (
                <div key={cover} sx={styles.cover} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  )
}
