import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Media } from "@/features/media/api/medias"
import { getRichTextParagraphs, parseRichText } from "@/components/rich-text/rich-text-document"
import { Cover } from "@/features/media/components/cover"
import { getSynopsis } from "@/features/media/lib/media-labels"

const styles = stylex.create({
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
    width: "100%",
  },
  cover: {
    borderRadius: radius.md,
    width: "2.5rem",
  },
  text: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  synopsis: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
})

export const getOptionSynopsis = (synopsis: Media["synopsis"]) =>
  (getRichTextParagraphs(parseRichText(getSynopsis(synopsis)))[0] ?? "").replace(/\s+/g, " ")

export function MediaOptionContent({
  title,
  coverUrl,
  synopsis,
  children,
}: {
  title: string
  coverUrl: string | null
  synopsis: string
  children?: ReactNode
}) {
  return (
    <span sx={styles.option}>
      <Cover src={coverUrl} sx={styles.cover} />
      <span sx={styles.text}>
        <span sx={styles.title}>{title}</span>
        {synopsis === "" ? null : <span sx={styles.synopsis}>{synopsis}</span>}
      </span>
      {children}
    </span>
  )
}
