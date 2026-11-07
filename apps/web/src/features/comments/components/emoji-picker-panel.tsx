import type { CSSProperties } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import EmojiPicker from "emoji-picker-react"
import { getTwemojiUrl, unifiedToEmoji } from "@/components/emoji/twemoji-url"
import { m } from "@/paraglide/messages"

const TWEMOJI_VERSION = "15.0"
const theme: CSSProperties = Object.fromEntries(
  Object.entries({
    "--epr-bg-color": "transparent",
    "--epr-picker-border-color": "transparent",
    "--epr-picker-border-radius": radius.lg,
    "--epr-font-family": font.sans,
    "--epr-text-color": colors.mutedForeground,
    "--epr-highlight-color": colors.primary,
    "--epr-hover-bg-color": colors.chipHover,
    "--epr-focus-bg-color": colors.chipHover,
    "--epr-search-input-bg-color": colors.field,
    "--epr-search-input-bg-color-active": colors.field,
    "--epr-search-input-text-color": colors.foreground,
    "--epr-search-input-placeholder-color": colors.mutedForeground,
    "--epr-search-border-color": colors.input,
    "--epr-search-border-color-active": colors.ring,
    "--epr-search-input-border-radius": radius.full,
    "--epr-search-input-height": "2.25rem",
    "--epr-category-label-bg-color": colors.popover,
    "--epr-category-label-text-color": colors.mutedForeground,
    "--epr-category-icon-active-color": colors.foreground,
    "--epr-category-icon-inactive-color": colors.mutedForeground,
    "--epr-skin-tone-picker-menu-color": colors.popover,
    "--epr-emoji-size": "28px",
  }),
)
const styles = stylex.create({
  root: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  credit: {
    color: colors.mutedForeground,
    fontSize: "0.6875rem",
    textAlign: "center",
  },
  link: {
    color: "inherit",
  },
})

export default function EmojiPickerPanel({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div sx={styles.root}>
      <EmojiPicker
        colorScheme="dark"
        emojiStyle="twitter"
        emojiVersion={TWEMOJI_VERSION}
        getEmojiUrl={(unified) => getTwemojiUrl(unifiedToEmoji(unified))}
        height={380}
        labels={{ searchPlaceholder: m.comments_emoji_search() }}
        lazyLoadEmojis
        onEmojiClick={(data) => {
          onPick(data.emoji)
        }}
        previewConfig={{ showPreview: false }}
        style={theme}
        width="100%"
      />
      <span sx={styles.credit}>
        {m.comments_emoji_credit_prefix()}{" "}
        <a
          href="https://github.com/jdecked/twemoji"
          rel="noreferrer"
          sx={styles.link}
          target="_blank"
        >
          Twemoji
        </a>{" "}
        · CC-BY 4.0
      </span>
    </div>
  )
}
