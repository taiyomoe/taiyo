import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, polar, spread, useSvgId } from "@/components/avatar-border/geometry"

const flame = (height: number) =>
  `M${CENTER - 4.2} ${CENTER - 52} C${CENTER - 5} ${CENTER - 52 - height * 0.45} ${CENTER - 1} ${CENTER - 52 - height * 0.7} ${CENTER} ${CENTER - 52 - height} C${CENTER + 1.5} ${CENTER - 52 - height * 0.6} ${CENTER + 5} ${CENTER - 52 - height * 0.45} ${CENTER + 4.2} ${CENTER - 52}Z`
const HEIGHTS = [15, 9, 12, 8, 14, 9, 11, 8, 13, 10, 12, 8]

export function PhoenixBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={id("flame")}
          x1={CENTER}
          x2={CENTER}
          y1={CENTER - 52}
          y2={CENTER - 68}
        >
          <stop offset="0" stopColor="#dc2626" />
          <stop offset="0.45" stopColor="#f97316" />
          <stop offset="1" stopColor="#fde047" />
        </linearGradient>
        <linearGradient id={id("ring")} x1="0" x2="1" y1="1" y2="0">
          <stop offset="0" stopColor="#7f1d1d" />
          <stop offset="0.5" stopColor="#ea580c" />
          <stop offset="1" stopColor="#facc15" />
        </linearGradient>
      </defs>
      {spread(HEIGHTS.length, 15).map((angle, index) => (
        <g key={angle} transform={`rotate(${angle} ${CENTER} ${CENTER})`}>
          <path
            d={flame(HEIGHTS[index] ?? 10)}
            fill={`url(#${id("flame")})`}
            opacity={0.92}
            sx={borderMotion.flicker(`${0.9 + (index % 4) * 0.18}s`, `${index * -0.13}s`)}
          />
        </g>
      ))}
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={53}
        stroke={`url(#${id("ring")})`}
        strokeWidth={4}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={51}
        stroke="rgb(254 240 138 / 60%)"
        strokeWidth={0.7}
      />
      {spread(6, 40).map((angle, index) => {
        const { x, y } = polar(60, angle)

        return (
          <circle
            key={angle}
            cx={x}
            cy={y}
            fill="#fde047"
            r={0.9}
            sx={borderMotion.rise(`${1.6 + index * 0.25}s`, `${index * -0.4}s`)}
          />
        )
      })}
    </>
  )
}
