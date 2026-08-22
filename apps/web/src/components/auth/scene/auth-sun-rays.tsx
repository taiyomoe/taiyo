import type { CSSProperties } from "react"

// Individual rays so each can have its own width and pulse on its own clock — a
// uniform conic gradient can't do that. Robustness (vs. earlier attempts) comes from
// the structure, not the geometry tricks:
//   - Rays render inside AuthSun's sun box (`absolute inset-0`), so they are exactly
//     concentric with the disk, and behind it (disk is painted after).
//   - Each ray's coloured band starts past its midpoint, so even at peak scaleY its
//     base stays hidden behind the opaque disk — rays emerge from the sun's edge and
//     breathe outward instead of exposing a base on the disk ("exiting").
// Per-ray values are derived from the index (deterministic → SSR-safe, no Math.random).
const N = 40
const RAYS = Array.from({ length: N }).map((_, i) => ({
  deg: (360 / N) * i,
  width: 5 + (i % 3) * 2,
  length: 400 + (i % 4) * 24,
  duration: 3 + (i % 5) * 0.6,
  delay: (i * 0.37) % 4,
  gold: i % 3 !== 0,
}))

export const AuthSunRays = () => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0" style={{ animation: "auth-spin 120s linear infinite" }}>
      {RAYS.map((ray, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: ray.width,
            height: ray.length,
            marginLeft: -ray.width / 2,
            transformOrigin: "top center",
            transform: `rotate(${ray.deg}deg)`,
          }}
        >
          <div
            style={
              {
                width: "100%",
                height: "100%",
                transformOrigin: "top center",
                borderRadius: "0 0 99px 99px",
                background: `linear-gradient(to bottom, transparent 0%, transparent 30%, ${
                  ray.gold ? "rgba(255,201,77,0.7)" : "rgba(251,110,84,0.6)"
                } 38%, ${ray.gold ? "rgba(255,184,32,0.22)" : "rgba(242,69,45,0.2)"} 70%, transparent 100%)`,
                // `backwards` fill-mode: during each ray's start delay it shows the
                // 0% keyframe (dim/short) instead of its natural full state, so rays
                // don't snap down one-by-one as their delays elapse on load.
                animation: `auth-ray-pulse ${ray.duration}s ease-in-out ${ray.delay}s infinite backwards`,
              } as CSSProperties
            }
          />
        </div>
      ))}
    </div>
  </div>
)
