import * as stylex from "@stylexjs/stylex"
import { mascotStyles } from "@/features/settings/components/mascot-styles"

export function SuggestiveMascot() {
  return (
    <svg aria-hidden viewBox="0 0 32 32" {...stylex.props(mascotStyles.mascot)}>
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
