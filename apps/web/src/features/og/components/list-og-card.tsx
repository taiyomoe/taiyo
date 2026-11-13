import {
  getInitial,
  OgBrand,
  OgCanvas,
  OgEyebrow,
  OgPicture,
  OgSun,
  OgText,
  OgTitle,
} from "@/features/og/components/og-parts"
import { OG_HEIGHT, OG_PADDING, ogColors } from "@/features/og/lib/og-theme"

export const LIST_TEXT_WIDTH = 500

const FAN_CENTER = { x: 910, y: 330 }
const FAN_COVER = { width: 200, height: 300 }
// From the outside in, so the middle cover lies on top.
const FAN = [
  { slot: 0, x: -190, y: 46, angle: -15 },
  { slot: 4, x: 190, y: 46, angle: 15 },
  { slot: 1, x: -98, y: 14, angle: -7.5 },
  { slot: 3, x: 98, y: 14, angle: 7.5 },
  { slot: 2, x: 0, y: 0, angle: 0 },
]

export type ListOgCardProps = {
  host: string
  name: string
  nameSize: number
  eyebrow: string
  description: string | null
  owner: { name: string; label: string; picture: string | null }
  covers: Array<string | null>
}

/**
 * A list's card: its first titles fanned out like a hand of cards in front of
 * the sun, with the list's name and owner on the left.
 */
export const ListOgCard = (props: ListOgCardProps) => {
  const covers = props.covers.slice(0, FAN.length)
  // A short list still sits centred: two covers take the two middle slots.
  const offset = Math.floor((FAN.length - covers.length) / 2)

  return (
    <OgCanvas>
      <OgSun
        x={FAN_CENTER.x}
        y={covers.length === 0 ? OG_HEIGHT / 2 : 150}
        radius={covers.length === 0 ? 150 : 128}
      />
      {FAN.filter(({ slot }) => slot >= offset && slot < offset + covers.length).map(
        ({ slot, x, y, angle }) => (
          <OgPicture
            key={slot}
            src={covers[slot - offset] ?? null}
            width={FAN_COVER.width}
            height={FAN_COVER.height}
            radius={16}
            style={{
              position: "absolute",
              left: FAN_CENTER.x + x - FAN_COVER.width / 2,
              top: FAN_CENTER.y + y - FAN_COVER.height / 2 + 30,
              transform: `rotate(${angle}deg)`,
            }}
          />
        ),
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          position: "absolute",
          left: OG_PADDING,
          top: OG_PADDING - 6,
          width: LIST_TEXT_WIDTH,
          height: OG_HEIGHT - OG_PADDING * 2 + 6,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            flexGrow: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <OgEyebrow>{props.eyebrow}</OgEyebrow>
          <OgTitle size={props.nameSize} lines={3}>
            {props.name}
          </OgTitle>
          {props.description === null ? null : (
            <OgText size={24} lines={3}>
              {props.description}
            </OgText>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <OgPicture
            src={props.owner.picture}
            width={46}
            height={46}
            radius={23}
            fallback={
              <span style={{ color: ogColors.night, fontSize: 22, fontWeight: 700 }}>
                {getInitial(props.owner.name)}
              </span>
            }
          />
          <OgText size={23} weight={600}>
            {props.owner.label}
          </OgText>
        </div>
        <OgBrand host={props.host} />
      </div>
    </OgCanvas>
  )
}
