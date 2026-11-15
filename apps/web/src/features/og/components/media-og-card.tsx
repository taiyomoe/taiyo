import { CoverOgCard } from "@/features/og/components/cover-og-card"
import { OgChip, OgChips, OgEyebrow, OgText, OgTitle } from "@/features/og/components/og-parts"
import { ogColors } from "@/features/og/lib/og-theme"

export type MediaOgCardProps = {
  host: string
  title: string
  titleSize: number
  altTitle: string | null
  synopsis: string | null
  synopsisLines: number
  eyebrow: string[]
  status: string
  years: string | null
  tags: Array<{ label: string }>
  cover: string | null
  sensitive: string | null
}

const TOP_HEIGHT = 330
const GAP = 18

/**
 * How many lines of synopsis fit under the title: a short title leaves room
 * for a few, a long one for none.
 */
export const getSynopsisLines = ({
  titleHeight,
  altTitle,
  chips,
}: {
  titleHeight: number
  altTitle: boolean
  chips: boolean
}) => {
  const free =
    TOP_HEIGHT - (chips ? 0 : 64) - 26 - GAP - titleHeight - (altTitle ? 36 + GAP : 0) - GAP

  return Math.max(0, Math.min(4, Math.floor(free / (22 * 1.4))))
}

export const MediaOgCard = (props: MediaOgCardProps) => (
  <CoverOgCard
    host={props.host}
    cover={props.cover}
    sensitive={props.sensitive}
    top={
      <>
        <OgEyebrow>{props.eyebrow.join("  ·  ")}</OgEyebrow>
        <OgTitle size={props.titleSize} lines={3}>
          {props.title}
        </OgTitle>
        {props.altTitle === null ? null : <OgText size={26}>{props.altTitle}</OgText>}
        {props.synopsis === null || props.synopsisLines === 0 ? null : (
          <OgText size={22} lines={props.synopsisLines} color={ogColors.paperFaint}>
            {props.synopsis}
          </OgText>
        )}
      </>
    }
    bottom={
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: ogColors.gold,
              boxShadow: `0 0 14px ${ogColors.gold}`,
            }}
          />
          <span style={{ fontWeight: 600 }}>{props.status}</span>
          {props.years === null ? null : (
            <span style={{ color: ogColors.paperFaint }}>{props.years}</span>
          )}
        </div>
        {props.tags.length === 0 ? null : (
          <OgChips>
            {props.tags.map((tag) => (
              <OgChip key={tag.label}>{tag.label}</OgChip>
            ))}
          </OgChips>
        )}
      </div>
    }
  />
)
