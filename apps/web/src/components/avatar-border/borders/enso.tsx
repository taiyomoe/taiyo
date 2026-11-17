import "@stylexjs/stylex"
import { borderMotion } from "@/components/avatar-border/border-motion"
import { CENTER, polar, spread, starPath, useSvgId } from "@/components/avatar-border/geometry"

// One brush stroke drawn clockwise from the bottom: pressed hard at the start, a little off-round
// like a hand-drawn ensō, then running dry and splitting into bristle strands at the end.
const START = 200
const SWEEP = 324
const RADIUS = 55.5
const STEP = 1 / 120
const angleAt = (t: number) => START + SWEEP * t
const radiusAt = (t: number) => RADIUS + 0.9 * Math.sin(t * 4.6 + 0.8)
const range = (from: number, to: number) =>
  Array.from({ length: Math.max(Math.round((to - from) / STEP), 1) + 1 }, (_, index) =>
    Math.min(from + index * STEP, to),
  )
/** The outline of a band following the stroke from `from` to `to`, `offset` off its center. */
const band = (from: number, to: number, offset: number, widthAt: (t: number) => number) => {
  const steps = range(from, to)
  const outer = steps.map((t) => polar(radiusAt(t) + offset + widthAt(t) / 2, angleAt(t)))
  const inner = steps.map((t) => polar(radiusAt(t) + offset - widthAt(t) / 2, angleAt(t)))

  return `M${[...outer, ...inner.reverse()].map(({ x, y }) => `${x} ${y}`).join(" L")}Z`
}
const BODY_END = 0.72
const bodyWidth = (t: number) => {
  const press = t < 0.06 ? 7.6 + t * 24 : 9 - 4.4 * ((t - 0.06) / (BODY_END - 0.06))
  const release = t > 0.64 ? Math.max(1 - (t - 0.64) / (BODY_END - 0.64), 0) : 1

  return Math.max(press * release * (1 + 0.06 * Math.sin(t * 23)), 0.2)
}
const HEAD = polar(radiusAt(0), START)
// The dry end: strands across the width of the brush, each tapering out at its own length and
// skipping where the brush ran out of ink.
const STRANDS = [
  { offset: -2.4, width: 1.3, to: 0.93, gaps: [[0.79, 0.81]] },
  { offset: -0.75, width: 1.6, to: 1, gaps: [[0.87, 0.89]] },
  {
    offset: 1,
    width: 1.4,
    to: 0.97,
    gaps: [
      [0.75, 0.765],
      [0.9, 0.92],
    ],
  },
  { offset: 2.6, width: 0.95, to: 0.85, gaps: [] },
]
const STRAND_FROM = 0.58
const BRUSH = [
  band(0, BODY_END, 0, bodyWidth),
  ...STRANDS.flatMap(({ offset, width, to, gaps }) => {
    const widthAt = (t: number) =>
      0.25 + width * (1 - ((t - STRAND_FROM) / (to - STRAND_FROM)) ** 1.3)
    const cuts = [STRAND_FROM, ...gaps.flat(), to]

    return Array.from({ length: cuts.length / 2 }, (_, index) =>
      band(cuts[index * 2] ?? 0, cuts[index * 2 + 1] ?? 0, offset, widthAt),
    )
  }),
].join(" ")
const DROPS = [
  { at: polar(63, 206), size: 1.5 },
  { at: polar(65.5, 214), size: 0.9 },
  { at: polar(61.5, 222), size: 0.7 },
]
const SEAL = polar(57, 146)
const SPARKS = [
  { at: polar(64, 28), size: 4.2, delay: "0s" },
  { at: polar(63, 102), size: 3, delay: "-1.1s" },
  { at: polar(65, 304), size: 3.6, delay: "-2.3s" },
]

export function EnsoBorder() {
  const id = useSvgId()

  return (
    <>
      <defs>
        <radialGradient id={id("aura")} r="0.5">
          <stop offset="0.68" stopColor="#fde68a" stopOpacity="0" />
          <stop offset="0.8" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("leaf")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.3" stopColor="#fcd34d" />
          <stop offset="0.62" stopColor="#f59e0b" />
          <stop offset="0.85" stopColor="#b45309" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
        <clipPath id={id("brush")}>
          <path d={BRUSH} />
          <circle cx={HEAD.x} cy={HEAD.y} r={3.9} />
        </clipPath>
        <filter height="160%" id={id("soft")} width="160%" x="-30%" y="-30%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <circle
        cx={CENTER}
        cy={CENTER}
        fill={`url(#${id("aura")})`}
        r={68}
        sx={borderMotion.breathe("5s", "0s")}
      />
      <g sx={borderMotion.spin("48s")}>
        {spread(4, 20).map((angle, index) => {
          const { x, y } = polar(63, angle)

          return (
            <g key={angle} transform={`translate(${x} ${y}) rotate(${angle + 8})`}>
              <g sx={borderMotion.sway(`${2.6 + index * 0.4}s`, `${index * -0.7}s`)}>
                <rect
                  fill="#fffbeb"
                  height={8.4}
                  rx={0.9}
                  stroke="#f59e0b"
                  strokeWidth={0.45}
                  width={6.2}
                  x={-3.1}
                  y={-4.2}
                />
                <path
                  d="M-1.9 -2.4 H1.9 M-1.9 -0.8 H1.9 M-1.9 0.8 H0.9 M-1.9 2.4 H1.4"
                  stroke="#d97706"
                  strokeLinecap="round"
                  strokeWidth={0.45}
                />
              </g>
            </g>
          )
        })}
      </g>
      <g filter={`url(#${id("soft")})`} transform="translate(0.6 1.2)">
        <path d={BRUSH} fill="rgb(69 26 3 / 55%)" />
        <circle cx={HEAD.x} cy={HEAD.y} fill="rgb(69 26 3 / 55%)" r={3.9} />
      </g>
      <path d={BRUSH} fill={`url(#${id("leaf")})`} />
      <circle cx={HEAD.x} cy={HEAD.y} fill={`url(#${id("leaf")})`} r={3.9} />
      <g clipPath={`url(#${id("brush")})`}>
        <circle
          cx={CENTER}
          cy={CENTER}
          fill="none"
          filter={`url(#${id("soft")})`}
          opacity={0.9}
          pathLength={100}
          r={RADIUS}
          stroke="#fffdf5"
          strokeDasharray="7 93"
          strokeLinecap="round"
          strokeWidth={14}
          sx={borderMotion.sweep("4.8s")}
        />
      </g>
      {DROPS.map(({ at, size }) => (
        <circle key={size} cx={at.x} cy={at.y} fill="#fbbf24" r={size} />
      ))}
      <g transform={`translate(${SEAL.x} ${SEAL.y}) rotate(-9)`}>
        <rect
          fill="rgb(0 0 0 / 35%)"
          filter={`url(#${id("soft")})`}
          height={13}
          rx={1.8}
          width={13}
          x={-6}
          y={-5.6}
        />
        <rect fill="#c81e1e" height={13} rx={1.8} width={13} x={-6.5} y={-6.5} />
        <rect
          fill="none"
          height={10.4}
          rx={1}
          stroke="#fff1f0"
          strokeWidth={0.6}
          width={10.4}
          x={-5.2}
          y={-5.2}
        />
        <path
          d="M-2.4 -3.5 H2.4 V3.5 H-2.4 Z M-2.4 0 H2.4"
          fill="none"
          stroke="#fff1f0"
          strokeLinejoin="round"
          strokeWidth={1.1}
        />
      </g>
      {SPARKS.map(({ at, size, delay }) => (
        <g key={delay} transform={`translate(${at.x} ${at.y})`}>
          <path d={starPath(size)} fill="#fffbeb" sx={borderMotion.twinkle("2.8s", delay)} />
        </g>
      ))}
    </>
  )
}
