import type { ComponentProps } from "react"

// Lightweight stand-in brand mark (a rising sun) — there is no Taiyō logo asset
// in the repo yet, so this keeps the auth scene self-contained.
export const TaiyoMark = (props: ComponentProps<"svg">) => (
  <svg viewBox="0 0 48 48" fill="none" aria-hidden {...props}>
    <defs>
      <radialGradient id="taiyo-mark-core" cx="50%" cy="42%" r="60%">
        <stop offset="0%" stopColor="#FFE3A0" />
        <stop offset="38%" stopColor="#FFB820" />
        <stop offset="72%" stopColor="#F2452D" />
        <stop offset="100%" stopColor="#B5281A" />
      </radialGradient>
    </defs>
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (Math.PI / 6) * i

      return (
        <line
          key={i}
          x1={24 + Math.cos(angle) * 19}
          y1={24 + Math.sin(angle) * 19}
          x2={24 + Math.cos(angle) * 23}
          y2={24 + Math.sin(angle) * 23}
          stroke="#FFB820"
          strokeWidth={2}
          strokeLinecap="round"
        />
      )
    })}
    <circle cx="24" cy="24" r="14" fill="url(#taiyo-mark-core)" />
  </svg>
)
