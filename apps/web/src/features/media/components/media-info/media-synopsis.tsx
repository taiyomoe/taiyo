import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { m } from "@/paraglide/messages"

const SYNOPSIS_PREVIEW_LENGTH = 700
const styles = stylex.create({
  synopsis: {
    gap: "0.875rem",
    color: `color-mix(in srgb, ${colors.foreground} 85%, transparent)`,
    display: "flex",
    flexDirection: "column",
    fontSize: "1rem",
    lineHeight: 1.7,
    maxWidth: "48rem",
  },
  synopsisCollapsed: {
    overflow: "hidden",
    maskImage: "linear-gradient(to bottom, black 55%, transparent)",
    maxHeight: "13.6em",
  },
  paragraph: {
    margin: 0,
    overflowWrap: "anywhere",
  },
})

export function MediaSynopsis({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const long = paragraphs.join(" ").length > SYNOPSIS_PREVIEW_LENGTH

  return (
    <>
      <div sx={[styles.synopsis, long && !expanded && styles.synopsisCollapsed]}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph} sx={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
      {long ? (
        <div>
          <Button
            onClick={() => {
              setExpanded(!expanded)
            }}
            size="sm"
            variant="ghost"
          >
            {expanded ? m.media_info_show_less() : m.media_info_show_more()}
          </Button>
        </div>
      ) : null}
    </>
  )
}
