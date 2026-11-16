import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { type CatalogBreakpoint, catalogHiddenFrom } from "@/features/catalog/lib/catalog-styles"
import { Cover } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

export const mediaCellStyles = stylex.create({
  cell: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  cover: {
    borderRadius: "0.375rem",
    flexShrink: 0,
    width: "2.25rem",
  },
  text: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.25,
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    textDecoration: { default: "none", ":hover": "underline" },
    color: colors.foreground,
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  detail: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  narrow: {
    gap: "0.375rem",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: "0.125rem",
  },
})

export function MediaCell({
  mediaId,
  title,
  coverUrl,
  thumb,
  detail,
  narrow,
}: {
  mediaId: string
  title: string | null
  coverUrl?: string | null | undefined
  /** Replaces the cover, for rows that show another image. */
  thumb?: ReactNode
  detail?: ReactNode
  /** What the hidden columns hold, shown under the title while they are hidden. */
  narrow?: { from: CatalogBreakpoint; content: ReactNode }
}) {
  return (
    <div sx={mediaCellStyles.cell}>
      {thumb ??
        (coverUrl === undefined ? null : <Cover src={coverUrl} sx={mediaCellStyles.cover} />)}
      <div sx={mediaCellStyles.text}>
        <Link params={{ mediaId }} to="/media/$mediaId" {...stylex.props(mediaCellStyles.title)}>
          {title ?? m.media_untitled()}
        </Link>
        {detail === undefined ? null : <span sx={mediaCellStyles.detail}>{detail}</span>}
        {narrow === undefined ? null : (
          <div sx={[mediaCellStyles.narrow, catalogHiddenFrom[narrow.from]]}>{narrow.content}</div>
        )}
      </div>
    </div>
  )
}
