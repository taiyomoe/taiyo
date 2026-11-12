import type { ContentRating, Language } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { StagedImage } from "@/features/media-images/hooks/use-staged-images"
import type { StagedCoverFields } from "@/features/media-images/lib/staged-cover"
import { LanguagePicker } from "@/components/fields/language-picker"
import { ContentRatingSelect } from "@/features/media-images/components/shared/content-rating-select"
import { StagedThumb } from "@/features/media-images/components/shared/staged-thumb"
import { parseVolumeInput } from "@/features/media-images/lib/staged-cover"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    gridTemplateAreas: {
      default: '"thumb file remove" "thumb fields fields"',
      [breakpoints.xl]: '"thumb file fields remove"',
    },
    paddingBlock: "0.875rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "auto minmax(0, 1fr) auto",
      [breakpoints.xl]: "auto minmax(0, 1fr) auto auto",
    },
    rowGap: "0.75rem",
    borderTopColor: colors.border,
    borderTopStyle: { default: "solid", ":first-child": "none" },
    borderTopWidth: 1,
  },
  thumb: {
    gridColumnEnd: "thumb",
    gridColumnStart: "thumb",
    gridRowEnd: "thumb",
    gridRowStart: "thumb",
  },
  file: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    gridColumnEnd: "file",
    gridColumnStart: "file",
    gridRowEnd: "file",
    gridRowStart: "file",
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    fontSize: "0.875rem",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  size: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  fields: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gridColumnEnd: "fields",
    gridColumnStart: "fields",
    gridRowEnd: "fields",
    gridRowStart: "fields",
  },
  volume: {
    width: "6.5rem",
  },
  language: {
    width: "12rem",
  },
  main: {
    gap: "0.5rem",
    paddingInline: "0.25rem",
    alignItems: "center",
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "flex",
    fontSize: "0.8125rem",
    fontWeight: 500,
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  remove: {
    color: colors.mutedForeground,
    gridColumnEnd: "remove",
    gridColumnStart: "remove",
    gridRowEnd: "remove",
    gridRowStart: "remove",
  },
})

export function StagedCoverRow({
  item,
  disabled,
  onChange,
  onRemove,
}: {
  item: StagedImage<StagedCoverFields>
  disabled: boolean
  onChange: (patch: Partial<StagedCoverFields>) => void
  onRemove: () => void
}) {
  const invalid = parseVolumeInput(item.volume) === undefined

  return (
    <li sx={styles.row}>
      <span sx={styles.thumb}>
        <StagedThumb kind="cover" src={item.previewUrl} />
      </span>
      <span sx={styles.file}>
        <span sx={styles.name} title={item.file.name}>
          {item.file.name}
        </span>
        <span sx={styles.size}>{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
      </span>
      <div sx={styles.fields}>
        <Input
          aria-invalid={invalid || undefined}
          aria-label={m.media_images_volume()}
          disabled={disabled}
          inputMode="decimal"
          onChange={(event) => {
            onChange({ volume: event.target.value })
          }}
          placeholder={m.media_images_volume()}
          sx={styles.volume}
          value={item.volume}
        />
        <span sx={styles.language}>
          <LanguagePicker
            onChange={(language: Language) => {
              onChange({ language })
            }}
            value={item.language}
          />
        </span>
        <ContentRatingSelect
          onChange={(contentRating: ContentRating) => {
            onChange({ contentRating })
          }}
          value={item.contentRating}
        />
        <label sx={styles.main}>
          <Switch
            checked={item.main}
            disabled={disabled}
            onCheckedChange={(main) => {
              onChange({ main })
            }}
          />
          {m.media_covers_main()}
        </label>
      </div>
      <Button
        aria-label={m.media_images_remove()}
        disabled={disabled}
        onClick={onRemove}
        size="icon-sm"
        sx={styles.remove}
        variant="ghost"
      >
        <Close />
      </Button>
    </li>
  )
}
