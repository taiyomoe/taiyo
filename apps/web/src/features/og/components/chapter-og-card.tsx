import type { ReactNode } from "react"
import { CoverOgCard } from "@/features/og/components/cover-og-card"
import { OgChip, OgChips, OgText, OgTitle } from "@/features/og/components/og-parts"
import { ogColors, ogFonts } from "@/features/og/lib/og-theme"

export type ChapterOgCardProps = {
  host: string
  mediaTitle: string
  headline: string
  chapterTitle: string | null
  chapterTitleSize: number
  chips: Array<{ label: string; icon?: ReactNode }>
  credits: string | null
  cover: string | null
  sensitive: string | null
}

export const ChapterOgCard = (props: ChapterOgCardProps) => (
  <CoverOgCard
    host={props.host}
    cover={props.cover}
    sensitive={props.sensitive}
    top={
      <>
        <OgText size={26} lines={2} weight={600} color={ogColors.paperMuted}>
          {props.mediaTitle}
        </OgText>
        <div
          style={{
            color: ogColors.goldLight,
            fontFamily: ogFonts.display,
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {props.headline}
        </div>
        {props.chapterTitle === null ? null : (
          <OgTitle size={props.chapterTitleSize} lines={2}>
            {props.chapterTitle}
          </OgTitle>
        )}
      </>
    }
    bottom={
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <OgChips>
          {props.chips.map((chip) => (
            <OgChip key={chip.label} icon={chip.icon}>
              {chip.label}
            </OgChip>
          ))}
        </OgChips>
        {props.credits === null ? null : <OgText size={22}>{props.credits}</OgText>}
      </div>
    }
  />
)
