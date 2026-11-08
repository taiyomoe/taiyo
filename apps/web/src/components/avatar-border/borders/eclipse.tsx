import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, polar, starPath, useSvgId } from "@/components/avatar-border/geometry"

const FLARE = polar(54, 45)

export function EclipseBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <radialGradient id={id("corona")} r="0.5">
          <stop offset="0.7" stopColor="#fef3c7" stopOpacity="0" />
          <stop offset="0.78" stopColor="#fffbeb" stopOpacity="0.95" />
          <stop offset="0.86" stopColor="#fcd34d" stopOpacity="0.4" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <filter height="160%" id={id("blur")} width="160%" x="-30%" y="-30%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <g sx={borderMotion.breathe("4.5s", "0s")}>
        <circle cx={CENTER + 1.5} cy={CENTER - 1.5} fill={`url(#${id("corona")})`} r={68} />
      </g>
      <g sx={borderMotion.spin("24s")}>
        <circle
          cx={CENTER}
          cy={CENTER}
          fill="none"
          filter={`url(#${id("blur")})`}
          pathLength={100}
          r={57}
          stroke="#fde68a"
          strokeDasharray="18 7 30 12 22 11"
          strokeWidth={3}
        />
      </g>
      <circle cx={CENTER} cy={CENTER} fill="none" r={53} stroke="#050505" strokeWidth={5} />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={55.6}
        stroke="rgb(255 251 235 / 85%)"
        strokeWidth={0.8}
      />
      <g transform={`translate(${FLARE.x} ${FLARE.y})`}>
        <circle fill="white" filter={`url(#${id("blur")})`} r={4} />
        <path d={starPath(9)} fill="white" sx={borderMotion.twinkle("3s", "0s")} />
      </g>
    </>
  )
}
