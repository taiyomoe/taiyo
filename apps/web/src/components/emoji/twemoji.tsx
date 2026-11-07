import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import { getTwemojiUrl } from "@/components/emoji/twemoji-url"

const styles = stylex.create({
  glyph: {
    marginInline: "0.05em",
    display: "inline-block",
    verticalAlign: "-0.22em",
    height: "1.2em",
    width: "1.2em",
  },
})

export function Twemoji({ emoji }: { emoji: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return emoji
  }

  return (
    <img
      alt={emoji}
      decoding="async"
      draggable={false}
      loading="lazy"
      onError={() => {
        setFailed(true)
      }}
      src={getTwemojiUrl(emoji)}
      sx={styles.glyph}
    />
  )
}
