import {
  getInitial,
  OgBrand,
  OgCanvas,
  OgEyebrow,
  OgPicture,
  OgStat,
  OgSun,
  OgText,
  OgTitle,
} from "@/features/og/components/og-parts"
import { OG_HEIGHT, OG_PADDING, OG_WIDTH, ogColors, ogFonts } from "@/features/og/lib/og-theme"

const PICTURE_SIZE = 264
const PICTURE_CENTER = { x: OG_PADDING + PICTURE_SIZE / 2 + 8, y: 272 }

export const IDENTITY_TEXT_WIDTH = OG_WIDTH - OG_PADDING * 2 - PICTURE_SIZE - 80

export type IdentityOgCardProps = {
  host: string
  name: string
  nameSize: number
  eyebrow: string | null
  handle: string | null
  shape: "circle" | "square"
  picture: string | null
  backdrop: string | null
  stats: Array<{ value: string; label: string }>
  about: string | null
}

/**
 * A user's card, and a group's: their picture eclipses the sun, so its corona
 * frames the avatar or the logo, and the name and numbers sit beside it.
 */
export const IdentityOgCard = (props: IdentityOgCardProps) => (
  <OgCanvas backdrop={props.backdrop}>
    <OgSun x={PICTURE_CENTER.x} y={PICTURE_CENTER.y} radius={PICTURE_SIZE / 2 + 14} />
    <OgPicture
      src={props.picture}
      width={PICTURE_SIZE}
      height={PICTURE_SIZE}
      radius={props.shape === "circle" ? PICTURE_SIZE / 2 : 52}
      style={{
        position: "absolute",
        left: PICTURE_CENTER.x - PICTURE_SIZE / 2,
        top: PICTURE_CENTER.y - PICTURE_SIZE / 2,
        border: `6px solid ${ogColors.night}`,
      }}
      fallback={
        <span
          style={{
            color: ogColors.night,
            fontFamily: ogFonts.display,
            fontSize: 132,
            fontWeight: 700,
          }}
        >
          {getInitial(props.name)}
        </span>
      }
    />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 16,
        position: "absolute",
        left: OG_WIDTH - OG_PADDING - IDENTITY_TEXT_WIDTH,
        top: OG_PADDING,
        width: IDENTITY_TEXT_WIDTH,
        height: OG_HEIGHT - OG_PADDING * 2 - 54,
      }}
    >
      {props.eyebrow === null ? null : <OgEyebrow>{props.eyebrow}</OgEyebrow>}
      <OgTitle size={props.nameSize} lines={2}>
        {props.name}
      </OgTitle>
      {props.handle === null ? null : (
        <OgText size={26} color={ogColors.paperFaint}>
          {props.handle}
        </OgText>
      )}
      {props.stats.length === 0 ? null : (
        <div style={{ display: "flex", gap: 44, marginTop: 14 }}>
          {props.stats.map((stat) => (
            <OgStat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      )}
      {props.about === null ? null : (
        <div style={{ display: "flex", marginTop: 12 }}>
          <OgText size={22} lines={2}>
            {props.about}
          </OgText>
        </div>
      )}
    </div>
    <OgBrand
      host={props.host}
      style={{ position: "absolute", left: OG_PADDING, bottom: OG_PADDING - 10 }}
    />
  </OgCanvas>
)
