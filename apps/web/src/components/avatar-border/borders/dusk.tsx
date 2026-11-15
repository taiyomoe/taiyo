import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, useSvgId } from "@/components/avatar-border/geometry"

export function DuskBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <linearGradient id={id("ring")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="0.5" stopColor="#f472b6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={55}
        stroke="rgb(244 114 182 / 22%)"
        strokeWidth={8}
        sx={borderMotion.breathe("4s", "0s")}
      />
      <g sx={borderMotion.spin("12s")}>
        <circle
          cx={CENTER}
          cy={CENTER}
          fill="none"
          r={53.5}
          stroke={`url(#${id("ring")})`}
          strokeWidth={4}
        />
      </g>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={51.2}
        stroke="rgb(255 237 213 / 45%)"
        strokeWidth={0.8}
      />
    </>
  )
}
