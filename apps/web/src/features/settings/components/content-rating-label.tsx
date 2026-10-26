import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ContentRating } from "@/lib/settings"

const sweep = stylex.keyframes({
  "0%": { backgroundPosition: "150% 0" },
  "45%": { backgroundPosition: "-50% 0" },
  "100%": { backgroundPosition: "-50% 0" },
})
const twinkle = stylex.keyframes({
  "0%": { opacity: 0, transform: "scale(0.3) rotate(0deg)" },
  "20%": { opacity: 1, transform: "scale(1) rotate(45deg)" },
  "40%": { opacity: 0, transform: "scale(0.3) rotate(90deg)" },
  "100%": { opacity: 0, transform: "scale(0.3) rotate(90deg)" },
})
const styles = stylex.create({
  label: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  mascot: {
    display: "block",
    flexShrink: 0,
    height: "1.625rem",
    width: "1.625rem",
  },
  mascotWrap: {
    display: "flex",
    flexShrink: 0,
    position: "relative",
  },
  shimmer: {
    WebkitBackgroundClip: "text",
    backgroundPosition: "150% 0",
    animationDuration: { default: "3.2s", "@media (prefers-reduced-motion: reduce)": "0s" },
    animationIterationCount: "infinite",
    animationName: sweep,
    animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundClip: "text",
    backgroundColor: colors.contentNsfw,
    backgroundImage: `linear-gradient(105deg, transparent 30%, color-mix(in srgb, ${colors.contentNsfwShine} 75%, transparent) 43%, ${colors.contentNsfwShine} 50%, color-mix(in srgb, ${colors.contentNsfwShine} 75%, transparent) 57%, transparent 70%)`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "200% 100%",
    color: "transparent",
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
const itemStyles = stylex.create({
  SUGGESTIVE: {
    backgroundColor: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentSuggestive} 14%, transparent)`,
      default: null,
    },
    color: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentSuggestive} 70%, ${colors.foreground})`,
      default: colors.contentSuggestive,
    },
  },
  NSFW: {
    backgroundColor: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentNsfw} 15%, transparent)`,
      default: null,
    },
    color: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentNsfw} 70%, ${colors.foreground})`,
      default: colors.contentNsfw,
    },
  },
  NSFL: {
    backgroundColor: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentNsfl} 16%, transparent)`,
      default: null,
    },
    color: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentNsfl} 70%, ${colors.foreground})`,
      default: colors.contentNsfl,
    },
  },
})

export const contentRatingItemSx = (rating: ContentRating): Sx | undefined =>
  rating === "NORMAL" ? undefined : itemStyles[rating]

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

function SuggestiveMascot() {
  return (
    <svg aria-hidden viewBox="0 0 32 32" {...stylex.props(styles.mascot)}>
      <path d="M4 17c0-8 5-13 12-13s12 5 12 13v9H4z" fill="#ff9a3c" />
      <circle cx="16" cy="18" fill="#ffe2cc" r="9.5" />
      <path d="M6.5 15c1-6 5-9 9.5-9s8.5 3 9.5 9c-3-1-5-3-6-5-2 2-6 4-13 5z" fill="#ff9a3c" />
      <path
        d="M10.5 18.5q1.6-1.6 3.2 0M18.3 18.5q1.6-1.6 3.2 0"
        fill="none"
        stroke="#5b2a12"
        strokeLinecap="round"
        strokeWidth="1.3"
      />
      <ellipse cx="10.2" cy="21.4" fill="#ff7b8a" opacity="0.75" rx="2.1" ry="1.2" />
      <ellipse cx="21.8" cy="21.4" fill="#ff7b8a" opacity="0.75" rx="2.1" ry="1.2" />
      <path
        d="M14.6 22.6q1.4 1.2 2.8 0"
        fill="none"
        stroke="#5b2a12"
        strokeLinecap="round"
        strokeWidth="1.1"
      />
      <path d="M24 9l1-2.4 1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1z" fill="#ffd36b" />
    </svg>
  )
}

function NsfwMascot() {
  return (
    <span sx={styles.mascotWrap}>
      <svg aria-hidden viewBox="0 0 32 32" {...stylex.props(styles.mascot)}>
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

function NsflMascot() {
  return (
    <svg aria-hidden viewBox="0 0 32 32" {...stylex.props(styles.mascot)}>
      <path d="M5 18c0-8 5-13 11-13s11 5 11 13v8H5z" fill="#2b1a2e" />
      <circle cx="16" cy="18" fill="#c9d3c2" r="9.5" />
      <path
        d="M6.5 16c.5-6 4.5-10 9.5-10s9 4 9.5 10c-2-1.5-3-3.5-3.5-5-1.5 2-4 3-6 3l1-2.5c-2 2-6 4-10.5 4.5z"
        fill="#2b1a2e"
      />
      <path
        d="M9.8 17.3l3 3M12.8 17.3l-3 3"
        stroke="#3a0d14"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
      <circle cx="21" cy="18.8" fill="#fff" r="2.1" />
      <circle cx="21.3" cy="19" fill="#b5122a" r="1.1" />
      <path
        d="M13.5 23.5l1.2-.8 1.2.8 1.2-.8 1.2.8"
        fill="none"
        stroke="#3a0d14"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
      />
      <path
        d="M22.5 11.5v4M21.3 12.6h2.4M21.3 14.4h2.4"
        stroke="#6b3a3a"
        strokeLinecap="round"
        strokeWidth="0.9"
      />
      <path d="M19 26.5c0 1.5.6 2.5 1.2 2.5s1.2-1 1.2-2.5" fill="#b5122a" />
    </svg>
  )
}

export function ContentRatingLabel({ rating, label }: { rating: ContentRating; label: string }) {
  if (rating === "NSFW") {
    return (
      <span sx={styles.label}>
        <NsfwMascot />
        <span sx={styles.shimmer}>{label}</span>
      </span>
    )
  }

  return (
    <span sx={styles.label}>
      {rating === "SUGGESTIVE" ? <SuggestiveMascot /> : null}
      {rating === "NSFL" ? <NsflMascot /> : null}
      {rating === "NORMAL" ? <span sx={styles.mascot} /> : null}
      {label}
    </span>
  )
}
