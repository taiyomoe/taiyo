import * as stylex from "@stylexjs/stylex"
import { MEDIA_LANGUAGES } from "@taiyomoe/db/constants"
import { ChevronDown, ChevronUp, Close, Crown } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Toggle } from "@taiyomoe/ui/components/ui/toggle"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaEditTitle } from "@/features/media-suggestions/lib/media-edit-model"
import { LanguagePicker } from "@/components/fields/language-picker"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  titleRow: {
    gap: "0.5rem",
    gridTemplateAreas: {
      default: '"main title title" "language language language" "acronym acronym actions"',
      [breakpoints.md]: '"main title language acronym actions"',
    },
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: {
      default: "auto minmax(0, 1fr) auto",
      [breakpoints.md]: "auto minmax(0, 1fr) 13rem auto auto",
    },
    borderBottomColor: colors.border,
    borderBottomStyle: { default: "dashed", [breakpoints.md]: "none" },
    borderBottomWidth: 1,
    paddingBottom: { default: "1rem", [breakpoints.md]: 0 },
  },
  main: {
    gridColumnEnd: "main",
    gridColumnStart: "main",
    gridRowEnd: "main",
    gridRowStart: "main",
  },
  title: {
    gridColumnEnd: "title",
    gridColumnStart: "title",
    gridRowEnd: "title",
    gridRowStart: "title",
  },
  titleLanguage: {
    gridColumnEnd: "language",
    gridColumnStart: "language",
    gridRowEnd: "language",
    gridRowStart: "language",
    minWidth: 0,
  },
  acronymArea: {
    gridColumnEnd: "acronym",
    gridColumnStart: "acronym",
    gridRowEnd: "acronym",
    gridRowStart: "acronym",
    justifySelf: "start",
  },
  rowActions: {
    gap: "0.125rem",
    gridColumn: "actions",
    gridRow: "actions",
    display: "flex",
  },
  acronym: {
    borderRadius: radius.full,
    paddingInline: "calc(1rem - 1px)",
    height: { default: "2.75rem", [breakpoints.sm]: "2.5rem" },
  },
  mainOn: {
    color: colors.warning,
  },
  mainOff: {
    color: colors.mutedForeground,
  },
})

export function TitleRow({
  title,
  first,
  last,
  onUpdate,
  onMakeMain,
  onMove,
  onRemove,
}: {
  title: MediaEditTitle
  first: boolean
  last: boolean
  onUpdate: (patch: Partial<MediaEditTitle>) => void
  onMakeMain: () => void
  onMove: (offset: number) => void
  onRemove: () => void
}) {
  return (
    <div sx={styles.titleRow}>
      <Button
        aria-label={m.media_edit_title_main()}
        aria-pressed={title.isMainTitle}
        onClick={onMakeMain}
        size="icon-xl"
        sx={styles.main}
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
        sx={styles.title}
        value={title.title}
      />
      <div sx={styles.titleLanguage}>
        <LanguagePicker
          languages={MEDIA_LANGUAGES}
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
        sx={[styles.acronym, styles.acronymArea]}
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
          size="icon-xl"
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
          size="icon-xl"
          variant="ghost"
        >
          <ChevronDown />
        </Button>
        <Button
          aria-label={m.media_edit_remove()}
          onClick={onRemove}
          size="icon-xl"
          variant="ghost"
        >
          <Close />
        </Button>
      </div>
    </div>
  )
}
