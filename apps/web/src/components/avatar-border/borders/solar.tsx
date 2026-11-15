import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, polar, spread, useSvgId } from "@/components/avatar-border/geometry"

export function SolarBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <radialGradient id={id("glow")} r="0.5">
          <stop offset="0.72" stopColor="#fbbf24" stopOpacity="0" />
          <stop offset="0.8" stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("ring")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="0.35" stopColor="#fbbf24" />
          <stop offset="0.7" stopColor="#d97706" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id={id("ray")} x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#fef3c7" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill={`url(#${id("glow")})`}
        r={68}
        sx={borderMotion.breathe("3.6s", "0s")}
      />
      <g sx={borderMotion.spin("40s")}>
        {spread(18).map((angle, index) => {
          const length = index % 2 === 0 ? 13 : 8
          const tip = polar(54 + length, angle)
          const left = polar(54, angle - 4)
          const right = polar(54, angle + 4)

          return (
            <polygon
              key={angle}
              fill={`url(#${id("ray")})`}
              points={`${left.x},${left.y} ${tip.x},${tip.y} ${right.x},${right.y}`}
            />
          )
        })}
      </g>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={53}
        stroke={`url(#${id("ring")})`}
        strokeWidth={4.5}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={50.8}
        stroke="rgb(254 243 199 / 70%)"
        strokeWidth={0.7}
      />
      <g sx={borderMotion.spinBack("6s")}>
        <circle
          cx={CENTER}
          cy={CENTER}
          fill="none"
          pathLength={100}
          r={53}
          stroke="#fffbeb"
          strokeDasharray="5 45"
          strokeLinecap="round"
          strokeWidth={2}
        />
      </g>
    </>
  )
}
