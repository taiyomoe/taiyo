import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, polar, spread, useSvgId } from "@/components/avatar-border/geometry"

export function TidalBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <linearGradient id={id("ring")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="0.5" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={53}
        stroke={`url(#${id("ring")})`}
        strokeWidth={3.5}
      />
      <g sx={borderMotion.spin("9s")}>
        <circle
          cx={CENTER}
          cy={CENTER}
          fill="none"
          pathLength={120}
          r={57}
          stroke="#38bdf8"
          strokeDasharray="9 6"
          strokeLinecap="round"
          strokeWidth={2}
        />
      </g>
      <g sx={borderMotion.spinBack("14s")}>
        <circle
          cx={CENTER}
          cy={CENTER}
          fill="none"
          pathLength={120}
          r={60.5}
          stroke="rgb(165 243 252 / 60%)"
          strokeDasharray="3 9"
          strokeLinecap="round"
          strokeWidth={1.2}
        />
      </g>
      {spread(5, 20).map((angle, index) => {
        const { x, y } = polar(62 + (index % 2) * 2, angle)

        return (
          <circle
            key={angle}
            cx={x}
            cy={y}
            fill="rgb(224 242 254 / 85%)"
            r={1.1 + (index % 3) * 0.4}
            sx={borderMotion.rise(`${2.6 + index * 0.3}s`, `${index * -0.7}s`)}
          />
        )
      })}
    </>
  )
}
