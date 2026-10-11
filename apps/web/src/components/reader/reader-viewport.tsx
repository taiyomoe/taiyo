import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

import { m } from "@/paraglide/messages"

const PAGE_WIDTH = 800
const PAGE_HEIGHT = 1200
const EAGER_PAGES = 2
const styles = stylex.create({
  strip: {
    marginInline: "auto",
    display: "flex",
    flexDirection: "column",
    maxWidth: "56rem",
    width: "100%",
  },
  page: {
    backgroundColor: colors.well,
    display: "block",
    height: "auto",
    width: "100%",
  },
})

export type ReaderPage = { id: string; url: string }

export function ReaderViewport({
  pages,
  observe,
}: {
  pages: ReaderPage[]
  observe: (element: HTMLElement | null) => void
}) {
  return (
    <div sx={styles.strip}>
      {pages.map((page, index) => (
        <img
          alt={m.reader_page_alt({ number: index + 1 })}
          data-index={index}
          decoding="async"
          fetchPriority={index === 0 ? "high" : undefined}
          height={PAGE_HEIGHT}
          key={page.id}
          loading={index < EAGER_PAGES ? "eager" : "lazy"}
          ref={observe}
          src={page.url}
          sx={styles.page}
          width={PAGE_WIDTH}
        />
      ))}
    </div>
  )
}
