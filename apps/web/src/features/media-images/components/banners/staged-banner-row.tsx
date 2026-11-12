import type { ContentRating } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { StagedImage } from "@/features/media-images/hooks/use-staged-images"
import { ContentRatingSelect } from "@/features/media-images/components/shared/content-rating-select"
import { StagedThumb } from "@/features/media-images/components/shared/staged-thumb"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    gridTemplateAreas: {
      default: '"thumb remove" "file file" "fields fields"',
      [breakpoints.md]: '"thumb file fields remove"',
    },
    paddingBlock: "0.875rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) auto",
      [breakpoints.md]: "auto minmax(0, 1fr) auto auto",
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
    gridColumnEnd: "fields",
    gridColumnStart: "fields",
    gridRowEnd: "fields",
    gridRowStart: "fields",
  },
  remove: {
    color: colors.mutedForeground,
    gridColumnEnd: "remove",
    gridColumnStart: "remove",
    gridRowEnd: "remove",
    gridRowStart: "remove",
  },
})

export function StagedBannerRow({
  item,
  disabled,
  onChange,
  onRemove,
}: {
  item: StagedImage<{ contentRating: ContentRating }>
  disabled: boolean
  onChange: (contentRating: ContentRating) => void
  onRemove: () => void
}) {
  return (
    <li sx={styles.row}>
      <span sx={styles.thumb}>
        <StagedThumb kind="banner" src={item.previewUrl} />
      </span>
      <span sx={styles.file}>
        <span sx={styles.name} title={item.file.name}>
          {item.file.name}
        </span>
        <span sx={styles.size}>{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
      </span>
      <div sx={styles.fields}>
        <ContentRatingSelect onChange={onChange} value={item.contentRating} />
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
