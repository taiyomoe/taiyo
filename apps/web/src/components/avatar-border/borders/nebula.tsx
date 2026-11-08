import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, polar, starPath, useSvgId } from "@/components/avatar-border/geometry"

const STARS = [
  { angle: 15, radius: 62, size: 3 },
  { angle: 70, radius: 58, size: 1.8 },
  { angle: 120, radius: 64, size: 2.4 },
  { angle: 185, radius: 59, size: 1.6 },
  { angle: 230, radius: 63, size: 3.2 },
  { angle: 290, radius: 58, size: 2 },
  { angle: 335, radius: 64, size: 1.6 },
] as const

export function NebulaBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <linearGradient id={id("cloud")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.35" stopColor="#c026d3" />
          <stop offset="0.65" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <filter height="140%" id={id("blur")} width="140%" x="-20%" y="-20%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <g sx={borderMotion.spin("16s")}>
        <circle
          cx={CENTER}
          cy={CENTER}
          fill="none"
          filter={`url(#${id("blur")})`}
          opacity={0.75}
          r={57}
          stroke={`url(#${id("cloud")})`}
          strokeWidth={9}
        />
      </g>
      <g sx={borderMotion.spinBack("22s")}>
        <circle
          cx={CENTER}
          cy={CENTER}
          fill="none"
          r={53}
          stroke={`url(#${id("cloud")})`}
          strokeWidth={3.5}
        />
      </g>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={51}
        stroke="rgb(224 231 255 / 50%)"
        strokeWidth={0.6}
      />
      {STARS.map((star, index) => {
        const { x, y } = polar(star.radius, star.angle)

        return (
          <g key={star.angle} transform={`translate(${x} ${y})`}>
            <path
              d={starPath(star.size)}
              fill="white"
              sx={borderMotion.twinkle(`${1.8 + (index % 3) * 0.7}s`, `${index * -0.45}s`)}
            />
          </g>
        )
      })}
    </>
  )
}
