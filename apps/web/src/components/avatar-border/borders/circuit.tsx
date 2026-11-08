import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, polar, spread } from "@/components/avatar-border/geometry"

export function CircuitBorder() {
  return (
    <>
      <circle cx={CENTER} cy={CENTER} fill="none" r={53} stroke="#14532d" strokeWidth={4} />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={53}
        stroke="rgb(74 222 128 / 55%)"
        strokeWidth={1}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        pathLength={333}
        r={53}
        stroke="#86efac"
        strokeDasharray="22 89"
        strokeLinecap="round"
        strokeWidth={2.4}
        sx={borderMotion.travel("3.2s")}
      />
      {spread(8, 22.5).map((angle, index) => {
        const start = polar(55, angle)
        const bend = polar(59, angle)
        const end = polar(61, angle + (index % 2 === 0 ? 9 : -9))

        return (
          <g key={angle}>
            <polyline
              fill="none"
              points={`${start.x},${start.y} ${bend.x},${bend.y} ${end.x},${end.y}`}
              stroke="#4ade80"
              strokeLinejoin="round"
              strokeWidth={1.1}
            />
            <circle
              cx={end.x}
              cy={end.y}
              fill="#bbf7d0"
              r={1.7}
              sx={borderMotion.breathe("1.8s", `${index * -0.22}s`)}
            />
          </g>
        )
      })}
    </>
  )
}
