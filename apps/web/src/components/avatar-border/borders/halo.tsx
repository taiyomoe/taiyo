import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, useSvgId } from "@/components/avatar-border/geometry"

export function HaloBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <linearGradient id={id("ring")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="0.45" stopColor="#94a3b8" />
          <stop offset="0.7" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={56}
        stroke="rgb(226 232 240 / 18%)"
        strokeWidth={6}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={53}
        stroke={`url(#${id("ring")})`}
        strokeWidth={3.5}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={57.5}
        stroke="rgb(248 250 252 / 35%)"
        strokeWidth={0.8}
      />
      <g sx={borderMotion.spin("7s")}>
        <circle
          cx={CENTER}
          cy={CENTER}
          fill="none"
          pathLength={100}
          r={53}
          stroke="white"
          strokeDasharray="7 93"
          strokeLinecap="round"
          strokeWidth={3.5}
        />
      </g>
    </>
  )
}
