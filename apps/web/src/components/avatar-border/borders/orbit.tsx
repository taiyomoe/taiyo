import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, useSvgId } from "@/components/avatar-border/geometry"

const SPARKS = [
  { radius: 53, size: 3.4, duration: "3.4s", color: "#e9d5ff" },
  { radius: 58, size: 2.6, duration: "5.5s", color: "#a5b4fc" },
  { radius: 62, size: 2, duration: "8s", color: "#f0abfc" },
] as const

export function OrbitBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <radialGradient id={id("spark")}>
          <stop offset="0" stopColor="white" />
          <stop offset="0.35" stopColor="white" stopOpacity="0.9" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("ring")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={53}
        stroke={`url(#${id("ring")})`}
        strokeWidth={2.5}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={58}
        stroke="rgb(165 180 252 / 22%)"
        strokeWidth={0.7}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        fill="none"
        r={62}
        stroke="rgb(240 171 252 / 16%)"
        strokeWidth={0.7}
      />
      {SPARKS.map((spark, index) => (
        <g
          key={spark.radius}
          sx={
            index === 1 ? borderMotion.spinBack(spark.duration) : borderMotion.spin(spark.duration)
          }
        >
          <circle
            cx={CENTER}
            cy={CENTER - spark.radius}
            fill={`url(#${id("spark")})`}
            r={spark.size * 2.4}
          />
          <circle cx={CENTER} cy={CENTER - spark.radius} fill={spark.color} r={spark.size * 0.55} />
          <circle
            cx={CENTER}
            cy={CENTER}
            fill="none"
            pathLength={100}
            r={spark.radius}
            stroke={spark.color}
            strokeDasharray="0 88 12 0"
            strokeLinecap="round"
            strokeOpacity={0.55}
            strokeWidth={spark.size * 0.5}
          />
        </g>
      ))}
    </>
  )
}
