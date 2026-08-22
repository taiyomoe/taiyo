import { Navbar } from "@/components/layout/navbar"
import { font, spacing, text } from "@taiyomoe/ui/styles/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: Home })

const styles = stylex.create({
  page: {
    padding: spacing.xl,
  },
  heading: {
    fontSize: text.xxxl,
    fontWeight: font.weightBold,
  },
  body: {
    fontSize: text.lg,
    marginTop: spacing.md,
  },
})

function Home() {
  return (
    <div {...stylex.props(styles.page)}>
      <Navbar />
      <h1 {...stylex.props(styles.heading)}>Welcome to TanStack Start</h1>
      <p {...stylex.props(styles.body)}>
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
    </div>
  )
}
