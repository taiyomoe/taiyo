import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { getMediaTags } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  tags: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  tag: {
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.3125rem",
    paddingInline: "0.75rem",
    backgroundColor: colors.chip,
    boxShadow: shadows.chip,
    color: colors.foreground,
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  genre: {
    fontWeight: 600,
  },
  spoiler: {
    borderStyle: "dashed",
    color: colors.mutedForeground,
  },
})

type MediaTagListProps = {
  tags: ReturnType<typeof getMediaTags>
}

export function MediaTagList({ tags }: MediaTagListProps) {
  const [showSpoilers, setShowSpoilers] = useState(false)
  const spoilers = tags.filter((tag) => tag.isSpoiler).length
  const visible = tags
    .filter((tag) => showSpoilers || !tag.isSpoiler)
    .sort((a, b) => Number(b.isGenre) - Number(a.isGenre))

  return (
    <ul sx={styles.tags}>
      {visible.map((tag) => (
        <li key={tag.key}>
          <span sx={[styles.tag, tag.isGenre && styles.genre, tag.isSpoiler && styles.spoiler]}>
            {tag.name}
          </span>
        </li>
      ))}
      {spoilers === 0 ? null : (
        <li>
          <Button
            onClick={() => {
              setShowSpoilers(!showSpoilers)
            }}
            size="xs"
            variant="ghost"
          >
            {showSpoilers
              ? m.media_info_hide_spoilers()
              : m.media_info_show_spoilers({ count: spoilers })}
          </Button>
        </li>
      )}
    </ul>
  )
}
