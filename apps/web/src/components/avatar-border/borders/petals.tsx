import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, polar, spread, useSvgId } from "@/components/avatar-border/geometry"

const PETAL = "M0 -6 C4 -4 4.5 2 0 6 C-4.5 2 -4 -4 0 -6Z"

export function PetalsBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <linearGradient id={id("petal")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff1f2" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id={id("ring")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fbcfe8" />
          <stop offset="1" stopColor="#db2777" />
        </linearGradient>
      </defs>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={53}
        stroke={`url(#${id("ring")})`}
        strokeWidth={3}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={56.5}
        stroke="rgb(251 207 232 / 50%)"
        strokeDasharray="1 5"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
      <g sx={borderMotion.spin("28s")}>
        {spread(7, 10).map((angle, index) => {
          const { x, y } = polar(index % 2 === 0 ? 59 : 62, angle)

          return (
            <g key={angle} transform={`translate(${x} ${y}) rotate(${angle + 40})`}>
              <path
                d={PETAL}
                fill={`url(#${id("petal")})`}
                stroke="rgb(190 24 93 / 35%)"
                strokeWidth={0.5}
                sx={borderMotion.sway(`${3 + (index % 3)}s`, `${index * -0.6}s`)}
              />
            </g>
          )
        })}
      </g>
    </>
  )
}
