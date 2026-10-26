import * as stylex from "@stylexjs/stylex"
import { ChevronDown, ChevronUp, Close, Crown } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Toggle } from "@taiyomoe/ui/components/ui/toggle"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaEditTitle } from "@/features/media-suggestions/lib/media-edit-model"
import { LanguagePicker } from "@/components/fields/language-picker"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  titleRow: {
    gap: "0.5rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: {
      default: "auto minmax(0, 1fr) auto",
      "@media (width >= 48rem)": "auto minmax(0, 1fr) 13rem auto auto",
    },
  },
  titleLanguage: {
    gridColumn: { default: "2 / -1", "@media (width >= 48rem)": "auto" },
  },
  rowActions: {
    gap: "0.125rem",
    display: "flex",
  },
  mainOn: {
    color: colors.warning,
  },
  mainOff: {
    color: colors.mutedForeground,
  },
})

type TitleRowProps = {
  title: MediaEditTitle
  first: boolean
  last: boolean
  onUpdate: (patch: Partial<MediaEditTitle>) => void
  onMakeMain: () => void
  onMove: (offset: number) => void
  onRemove: () => void
}

export function TitleRow({
  title,
  first,
  last,
  onUpdate,
  onMakeMain,
  onMove,
  onRemove,
}: TitleRowProps) {
  return (
    <div sx={styles.titleRow}>
      <Button
        aria-label={m.media_edit_title_main()}
        aria-pressed={title.isMainTitle}
        onClick={onMakeMain}
        size="icon-sm"
        title={m.media_edit_title_main()}
        variant="ghost"
      >
        <Crown {...stylex.props(title.isMainTitle ? styles.mainOn : styles.mainOff)} />
      </Button>
      <Input
        aria-label={m.media_edit_field_titles()}
        onChange={(event) => {
          onUpdate({ title: event.target.value })
        }}
        value={title.title}
      />
      <div sx={styles.titleLanguage}>
        <LanguagePicker
          onChange={(language) => {
            onUpdate({ language })
          }}
          value={title.language}
        />
      </div>
      <Toggle
        onPressedChange={(isAcronym) => {
          onUpdate({ isAcronym })
        }}
        pressed={title.isAcronym}
        size="sm"
        variant="outline"
      >
        {m.media_edit_title_acronym()}
      </Toggle>
      <div sx={styles.rowActions}>
        <Button
          aria-label={m.media_edit_move_up()}
          disabled={first}
          onClick={() => {
            onMove(-1)
          }}
          size="icon-sm"
          variant="ghost"
        >
          <ChevronUp />
        </Button>
        <Button
          aria-label={m.media_edit_move_down()}
          disabled={last}
          onClick={() => {
            onMove(1)
          }}
          size="icon-sm"
          variant="ghost"
        >
          <ChevronDown />
        </Button>
        <Button
          aria-label={m.media_edit_remove()}
          onClick={onRemove}
          size="icon-sm"
          variant="ghost"
        >
          <Close />
        </Button>
      </div>
    </div>
  )
}
