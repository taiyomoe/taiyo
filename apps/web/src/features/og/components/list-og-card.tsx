import {
  getInitial,
  OgBrand,
  OgCanvas,
  OgEyebrow,
  OgPicture,
  OgText,
  OgTitle,
} from "@/features/og/components/og-parts"
import { OG_HEIGHT, OG_PADDING, ogColors } from "@/features/og/lib/og-theme"

export const LIST_TEXT_WIDTH = 500

const FAN_CENTER = { x: 910, y: 330 }
const FAN_COVER = { width: 200, height: 300 }
// The list's first title in the middle and on top, the next two beside it,
// the last two on the outside:
//       1
//     2   3
//   4       5
const FAN = [
  { x: 0, y: 0, angle: 0 },
  { x: -98, y: 14, angle: -7.5 },
  { x: 98, y: 14, angle: 7.5 },
  { x: -190, y: 46, angle: -15 },
  { x: 190, y: 46, angle: 15 },
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

  return (
    <OgCanvas
      sun={
        covers.length === 0
          ? { x: FAN_CENTER.x, y: OG_HEIGHT / 2, radius: 150 }
          : { x: FAN_CENTER.x, y: 150, radius: 128 }
      }
    >
      {/* Drawn from the last to the first, so the first lies on top. */}
      {[...covers.entries()].reverse().map(([index, cover]) => {
        const place = FAN[index] ?? { x: 0, y: 0, angle: 0 }

        return (
          <OgPicture
            key={index}
            src={cover}
            width={FAN_COVER.width}
            height={FAN_COVER.height}
            radius={16}
            style={{
              position: "absolute",
              left: FAN_CENTER.x + place.x - FAN_COVER.width / 2,
              top: FAN_CENTER.y + place.y - FAN_COVER.height / 2 + 30,
              transform: `rotate(${place.angle}deg)`,
            }}
          />
        )
      })}
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
