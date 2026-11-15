import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { Cover } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  cell: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  cover: {
    flexShrink: 0,
    width: "2.5rem",
  },
  text: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
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
})

export function MediaCell({
  mediaId,
  title,
  coverUrl,
  detail,
}: {
  mediaId: string
  title: string | null
  coverUrl?: string | null | undefined
  detail?: string | undefined
}) {
  return (
    <div sx={styles.cell}>
      {coverUrl === undefined ? null : <Cover src={coverUrl} sx={styles.cover} />}
      <div sx={styles.text}>
        <Link params={{ mediaId }} to="/media/$mediaId" {...stylex.props(styles.title)}>
          {title ?? m.media_untitled()}
        </Link>
        {detail === undefined ? null : <span sx={styles.detail}>{detail}</span>}
      </div>
    </div>
  )
}
