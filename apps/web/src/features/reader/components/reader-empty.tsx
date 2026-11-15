import * as stylex from "@stylexjs/stylex"
import { ArrowLeft } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    inset: 0,
    padding: "1.5rem",
    gap: "0.75rem",
    alignItems: "center",
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "fixed",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    marginBottom: "0.5rem",
  },
})

export function ReaderEmpty({ mediaId }: { mediaId: string }) {
  return (
    <div sx={styles.root}>
      <h1 sx={styles.title}>{m.reader_empty_title()}</h1>
      <p sx={styles.description}>{m.reader_empty_description()}</p>
      <Button render={<Link params={{ mediaId }} to="/media/$mediaId" />} variant="outline">
        <ArrowLeft />
        {m.reader_back_to_title()}
      </Button>
    </div>
  )
}
