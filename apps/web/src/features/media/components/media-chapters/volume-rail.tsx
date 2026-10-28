import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaChapterFacets } from "@/features/chapters/api/chapters"
import { VolumeItem } from "@/features/media/components/media-chapters/volume-item"
import { NO_VOLUME, getVolumeName } from "@/features/media/lib/chapter-volumes"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  rail: {
    margin: 0,
    padding: "0.375rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.125rem",
    listStyle: "none",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "flex",
    flexDirection: { [breakpoints.xl]: "column", default: "row" },
    position: { [breakpoints.xl]: "sticky", default: "static" },
    scrollbarWidth: "none",
    overflowX: { [breakpoints.xl]: "visible", default: "auto" },
    top: "calc(var(--navbar-height) + 1rem)",
  },
})
const getRange = (first: number, last: number) =>
  first === last ? m.chapter_number({ number: first }) : m.media_chapters_range({ first, last })

type VolumeRailProps = {
  facets: MediaChapterFacets
  selected: string | undefined
  onSelect: (volume: string | undefined) => void
}

export function VolumeRail({ facets, selected, onSelect }: VolumeRailProps) {
  const first = Math.min(...facets.volumes.map((volume) => volume.firstNumber))
  const last = Math.max(...facets.volumes.map((volume) => volume.lastNumber))

  return (
    <nav aria-label={m.media_chapters_volumes()}>
      <ul sx={styles.rail}>
        <VolumeItem
          active={selected === undefined}
          count={facets.total}
          name={m.media_chapters_all()}
          onClick={() => {
            onSelect(undefined)
          }}
          range={facets.total === 0 ? null : getRange(first, last)}
        />
        {facets.volumes.map((volume) => {
          const value = volume.volume ?? NO_VOLUME

          return (
            <VolumeItem
              key={value}
              active={selected === value}
              count={volume.count}
              name={getVolumeName(volume.volume)}
              onClick={() => {
                onSelect(value)
              }}
              range={getRange(volume.firstNumber, volume.lastNumber)}
            />
          )
        })}
      </ul>
    </nav>
  )
}
