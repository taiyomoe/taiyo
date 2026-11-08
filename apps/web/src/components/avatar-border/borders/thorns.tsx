import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, polar, spread, useSvgId } from "@/components/avatar-border/geometry"

const vinePath = () => {
  const points = spread(48).map((angle, index) =>
    polar(Math.round((53.5 + Math.sin(index * 1.3) * 1.6) * 100) / 100, angle),
  )

  return `${points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ")}Z`
}
const VINE = vinePath()
const ROSE = polar(55, 135)

export function ThornsBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <linearGradient id={id("vine")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#be123c" />
          <stop offset="0.6" stopColor="#4c0519" />
          <stop offset="1" stopColor="#9f1239" />
        </linearGradient>
        <radialGradient id={id("bloom")}>
          <stop offset="0" stopColor="#fda4af" />
          <stop offset="0.55" stopColor="#e11d48" />
          <stop offset="1" stopColor="#881337" />
        </radialGradient>
      </defs>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={55}
        stroke="rgb(225 29 72 / 30%)"
        strokeWidth={7}
        sx={borderMotion.breathe("3.2s", "0s")}
      />
      <path
        d={VINE}
        fill="none"
        stroke={`url(#${id("vine")})`}
        strokeLinejoin="round"
        strokeWidth={3.2}
      />
      {spread(14, 6).map((angle, index) => {
        const base = polar(55, angle)
        const tip = polar(61 + (index % 3), angle + 7)
        const back = polar(55, angle + 6)

        return (
          <polygon
            key={angle}
            fill="#4c0519"
            points={`${base.x},${base.y} ${tip.x},${tip.y} ${back.x},${back.y}`}
            stroke="#9f1239"
            strokeLinejoin="round"
            strokeWidth={0.6}
          />
        )
      })}
      {[300, 30].map((angle) => {
        const { x, y } = polar(58, angle)

        return (
          <ellipse
            key={angle}
            cx={x}
            cy={y}
            fill="#166534"
            rx={4}
            ry={1.8}
            stroke="#14532d"
            strokeWidth={0.5}
            transform={`rotate(${angle + 30} ${x} ${y})`}
          />
        )
      })}
      <g transform={`translate(${ROSE.x} ${ROSE.y})`}>
        {spread(5, 15).map((angle) => (
          <ellipse
            key={angle}
            cx={0}
            cy={-4}
            fill={`url(#${id("bloom")})`}
            rx={4.2}
            ry={5.4}
            stroke="#881337"
            strokeWidth={0.5}
            transform={`rotate(${angle})`}
          />
        ))}
        <circle fill="#be123c" r={3.6} stroke="#4c0519" strokeWidth={0.6} />
        <path d="M-1.8 0 Q0 -2.6 1.8 0 Q0 1.8 -1.8 0Z" fill="#fecdd3" opacity={0.8} />
      </g>
    </>
  )
}
