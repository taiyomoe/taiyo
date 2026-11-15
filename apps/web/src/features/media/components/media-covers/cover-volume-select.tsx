import * as stylex from "@stylexjs/stylex"
import { Book } from "@taiyomoe/ui/components/icons"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { VolumeGroup } from "@/features/media/lib/media-images"
import { getVolumeName } from "@/features/media/lib/chapter-volumes"
import { m } from "@/paraglide/messages"

const ALL_VOLUMES = "all"
const styles = stylex.create({
  trigger: {
    maxWidth: "14rem",
    minWidth: "10rem",
    width: "auto",
  },
  value: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  icon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  text: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  item: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    whiteSpace: "nowrap",
    width: "100%",
  },
  count: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    marginInlineStart: "auto",
    paddingInlineStart: "1rem",
  },
})

export function CoverVolumeSelect({
  groups,
  total,
  selected,
  onSelect,
}: {
  groups: readonly VolumeGroup[]
  total: number
  selected: string | undefined
  onSelect: (volume: string | undefined) => void
}) {
  const current = groups.find((group) => group.key === selected)

  return (
    <Select
      onValueChange={(next) => {
        onSelect(next === null || next === ALL_VOLUMES ? undefined : next)
      }}
      value={selected ?? ALL_VOLUMES}
    >
      <SelectTrigger aria-label={m.media_chapters_volumes()} sx={styles.trigger}>
        <SelectValue>
          {() => (
            <span sx={styles.value}>
              <Book size={16} {...stylex.props(styles.icon)} />
              <span sx={styles.text}>
                {current === undefined
                  ? m.media_covers_all_volumes()
                  : getVolumeName(current.volume)}
              </span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectPopup>
        <SelectItem value={ALL_VOLUMES}>
          <span sx={styles.item}>
            {m.media_covers_all_volumes()}
            <span sx={styles.count}>{total}</span>
          </span>
        </SelectItem>
        {groups.map((group) => (
          <SelectItem key={group.key} value={group.key}>
            <span sx={styles.item}>
              {getVolumeName(group.volume)}
              <span sx={styles.count}>{group.covers.length}</span>
            </span>
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}
