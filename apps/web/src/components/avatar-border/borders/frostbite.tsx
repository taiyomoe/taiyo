import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, polar, spread, starPath, useSvgId } from "@/components/avatar-border/geometry"

const SHARD_LENGTHS = [11, 6, 8, 5, 13, 6, 9, 5, 10, 7, 12, 5]

export function FrostbiteBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <linearGradient id={id("ice")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f0f9ff" />
          <stop offset="0.5" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id={id("shard")} x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#f0f9ff" />
        </linearGradient>
      </defs>
      {spread(SHARD_LENGTHS.length, 8).map((angle, index) => {
        const length = SHARD_LENGTHS[index] ?? 6
        const tip = polar(54 + length, angle)
        const left = polar(53, angle - 4.5)
        const right = polar(53, angle + 4.5)

        return (
          <polygon
            key={angle}
            fill={`url(#${id("shard")})`}
            points={`${left.x},${left.y} ${tip.x},${tip.y} ${right.x},${right.y}`}
            stroke="rgb(240 249 255 / 70%)"
            strokeLinejoin="round"
            strokeWidth={0.5}
          />
        )
      })}
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={53}
        stroke={`url(#${id("ice")})`}
        strokeWidth={3.5}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={51.3}
        stroke="rgb(255 255 255 / 55%)"
        strokeWidth={0.6}
      />
      {[20, 135, 250, 318].map((angle, index) => {
        const { x, y } = polar(index % 2 === 0 ? 63 : 60, angle)

        return (
          <g key={angle} transform={`translate(${x} ${y})`}>
            <path
              d={starPath(3.2)}
              fill="white"
              sx={borderMotion.twinkle(`${2.2 + index * 0.4}s`, `${index * -0.8}s`)}
            />
          </g>
        )
      })}
    </>
  )
}
