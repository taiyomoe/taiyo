import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { ChevronRight } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Kbd } from "@taiyomoe/ui/components/ui/kbd"
import { colors, text } from "@taiyomoe/ui/styles/tokens.stylex"

import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "1.25rem",
    paddingInline: "1.5rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    paddingBlockEnd: "6rem",
    paddingBlockStart: "4rem",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: text.xl,
    fontWeight: 600,
  },
  sub: {
    margin: 0,
    color: colors.mutedForeground,
  },
  actions: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
})

export function ReaderEnd({
  mediaId,
  next,
  nextHeading,
}: {
  mediaId: string
  next: { id: string } | null
  nextHeading: string | null
}) {
  return (
    <section sx={styles.root}>
      <h2 sx={styles.title}>{m.reader_end_title()}</h2>
      {next ? null : <p sx={styles.sub}>{m.reader_end_last()}</p>}
      <div sx={styles.actions}>
        <Button render={<Link params={{ mediaId }} to="/titles/$mediaId" />} variant="outline">
          {m.reader_back()}
          <Kbd>Esc</Kbd>
        </Button>
        {next ? (
          <Button
            render={
              <Link params={{ mediaId, chapterId: next.id }} to="/read/$mediaId/$chapterId" />
            }
          >
            {nextHeading ?? m.reader_next_chapter()}
            <ChevronRight />
          </Button>
        ) : null}
      </div>
    </section>
  )
}
