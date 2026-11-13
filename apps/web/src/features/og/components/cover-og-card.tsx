import type { ReactNode } from "react"
import { OgBrand, OgCanvas, OgPicture, OgSun } from "@/features/og/components/og-parts"
import { OG_HEIGHT, OG_PADDING, OG_WIDTH } from "@/features/og/lib/og-theme"

const COVER_WIDTH = 330
const COVER_HEIGHT = 495

export const COVER_TEXT_WIDTH = OG_WIDTH - OG_PADDING * 3 - COVER_WIDTH

const coverTop = (OG_HEIGHT - COVER_HEIGHT) / 2
const coverLeft = OG_WIDTH - OG_PADDING - COVER_WIDTH

/**
 * A title's card, and a chapter's: the cover stands on the right with the sun
 * rising behind its top corner, the text runs down the left.
 */
export const CoverOgCard = ({
  host,
  cover,
  sensitive,
  top,
  bottom,
}: {
  host: string
  cover: string | null
  /** The content rating to show over a blurred cover, when it is not one shown by default. */
  sensitive: string | null
  top: ReactNode
  bottom?: ReactNode
}) => (
  <OgCanvas backdrop={sensitive === null ? cover : null}>
    <OgSun x={coverLeft + COVER_WIDTH - 34} y={coverTop + 40} radius={118} />
    <OgPicture
      src={cover}
      width={COVER_WIDTH}
      height={COVER_HEIGHT}
      radius={22}
      label={sensitive}
      style={{ position: "absolute", left: coverLeft, top: coverTop }}
    />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "absolute",
        left: OG_PADDING,
        top: OG_PADDING - 6,
        width: COVER_TEXT_WIDTH,
        height: OG_HEIGHT - OG_PADDING * 2 + 6,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 18,
          flexGrow: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {top}
      </div>
      {bottom}
      <OgBrand host={host} />
    </div>
  </OgCanvas>
)
