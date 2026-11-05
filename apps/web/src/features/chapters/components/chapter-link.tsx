import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  link: {
    textDecoration: "none",
    color: "inherit",
    display: "inline-flex",
    flexShrink: 0,
    opacity: { default: 1, ":hover": 0.72 },
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
  },
})

export function ChapterLink({
  chapter,
  children,
}: {
  chapter: Pick<LatestChapter, "id" | "isExternal">
  children: ReactNode
}) {
  return chapter.isExternal ? (
    <Link
      params={{ chapterId: chapter.id }}
      {...stylex.props(styles.link)}
      title={m.chapter_external()}
      to="/chapters/$chapterId/source"
    >
      {children}
    </Link>
  ) : (
    <Link
      params={{ chapterId: chapter.id }}
      to="/chapters/$chapterId"
      {...stylex.props(styles.link)}
    >
      {children}
    </Link>
  )
}
