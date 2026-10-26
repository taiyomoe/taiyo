import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { mascotStyles } from "@/features/settings/components/mascot-styles"

const twinkle = stylex.keyframes({
  "0%": { opacity: 0, transform: "scale(0.3) rotate(0deg)" },
  "20%": { opacity: 1, transform: "scale(1) rotate(45deg)" },
  "40%": { opacity: 0, transform: "scale(0.3) rotate(90deg)" },
  "100%": { opacity: 0, transform: "scale(0.3) rotate(90deg)" },
})
const styles = stylex.create({
  mascotWrap: {
    display: "flex",
    flexShrink: 0,
    position: "relative",
  },
  sparkle: {
    animationDuration: "3.2s",
    animationIterationCount: "infinite",
    animationName: twinkle,
    animationTimingFunction: "ease-out",
    color: `color-mix(in srgb, ${colors.contentNsfw} 35%, ${colors.contentNsfwShine})`,
    display: { default: "block", "@media (prefers-reduced-motion: reduce)": "none" },
    filter: `drop-shadow(0 0 2px ${colors.contentNsfw})`,
    opacity: 0,
    position: "absolute",
  },
  sparkleTop: {
    animationDelay: "-0.4s",
    height: "0.5rem",
    left: "-0.1875rem",
    top: "-0.125rem",
    width: "0.5rem",
  },
  sparkleBottom: {
    animationDelay: "-0.05s",
    bottom: "0.0625rem",
    height: "0.375rem",
    right: "-0.125rem",
    width: "0.375rem",
  },
})

function Sparkle({ sx }: { sx: Sx }) {
  return (
    <svg aria-hidden viewBox="0 0 10 10" {...stylex.props(styles.sparkle, sx)}>
      <path
        d="M5 0c.4 2.6 1.4 3.6 5 5-3.6 1.4-4.6 2.4-5 5-.4-2.6-1.4-3.6-5-5 3.6-1.4 4.6-2.4 5-5z"
        fill="currentColor"
      />
    </svg>
  )
}

export function NsfwMascot() {
  return (
    <span sx={styles.mascotWrap}>
      <svg aria-hidden viewBox="0 0 32 32" {...stylex.props(mascotStyles.mascot)}>
        <ellipse cx="4.6" cy="20" fill="#ff5fae" rx="3" ry="7" transform="rotate(14 4.6 20)" />
        <ellipse cx="27.4" cy="20" fill="#ff5fae" rx="3" ry="7" transform="rotate(-14 27.4 20)" />
        <circle cx="16" cy="17.5" fill="#ffe4dc" r="9.5" />
        <path
          d="M6.5 15.5C7 9 11 6 16 6s9 3 9.5 9.5c-2.5-.5-4.5-2-5.5-4-1 2-3.5 3.5-6 3.5 1-1 1.3-2 1.2-3-1.6 2.3-4.5 3.7-8.7 3.5z"
          fill="#ff5fae"
        />
        <path
          d="M8.6 18.4c0-1 .8-1.6 1.6-1.6s1.2.6 1.4.9c.2-.3.7-.9 1.4-.9.8 0 1.6.6 1.6 1.6 0 1.6-3 3.3-3 3.3s-3-1.7-3-3.3z"
          fill="#ff2f86"
        />
        <path
          d="M18.4 18.7q1.7-1.4 3.4 0"
          fill="none"
          stroke="#4a1030"
          strokeLinecap="round"
          strokeWidth="1.3"
        />
        <ellipse cx="21.6" cy="21.3" fill="#ff7bb0" opacity="0.8" rx="1.9" ry="1.1" />
        <path
          d="M14.8 22.8q1.2.9 2.4 0"
          fill="none"
          stroke="#4a1030"
          strokeLinecap="round"
          strokeWidth="1.1"
        />
        <path
          d="M23 5.5c0-.9.7-1.4 1.4-1.4s1 .5 1.2.8c.2-.3.6-.8 1.2-.8.7 0 1.4.5 1.4 1.4 0 1.4-2.6 2.9-2.6 2.9S23 6.9 23 5.5z"
          fill="#ff4fa3"
        />
      </svg>
      <Sparkle sx={styles.sparkleTop} />
      <Sparkle sx={styles.sparkleBottom} />
    </span>
  )
}
