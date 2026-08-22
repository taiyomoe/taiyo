import type { CSSProperties } from "react"

// Deterministic pseudo-random so SSR and client render identically (no hydration
// mismatch). Math.random() would diverge between server and browser.
const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453

  return x - Math.floor(x)
}
// Round to 2 decimals so the serialized SSR style string and the client's
// float carry identical precision — otherwise the browser rounds long floats
// (5.721816935692914% -> 5.72182%) and React flags a hydration mismatch.
const round = (n: number) => Math.round(n * 100) / 100
const EMBERS = Array.from({ length: 26 }).map((_, i) => {
  const size = round(2 + rand(i + 100) * 4)

  return {
    left: round(rand(i) * 100),
    size,
    delay: round(rand(i + 200) * 9),
    dur: round(9 + rand(i + 300) * 9),
    drift: `${round(rand(i + 400) * 120 - 60)}px`,
    glow: round(size * 3),
    gold: rand(i + 500) > 0.5,
  }
})

export const AuthEmbers = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {EMBERS.map((ember, i) => (
      <span
        key={i}
        style={
          {
            position: "absolute",
            bottom: -10,
            left: `${ember.left}%`,
            width: ember.size,
            height: ember.size,
            borderRadius: "50%",
            background: ember.gold ? "#FFC94D" : "#FB6E54",
            boxShadow: `0 0 ${ember.glow}px ${ember.gold ? "#FFB820" : "#F2452D"}`,
            "--drift": ember.drift,
            animation: `auth-ember-rise ${ember.dur}s linear ${ember.delay}s infinite`,
          } as CSSProperties
        }
      />
    ))}
  </div>
)
