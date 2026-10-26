import * as stylex from "@stylexjs/stylex"
import { mascotStyles } from "@/features/settings/components/mascot-styles"

export function NsflMascot() {
  return (
    <svg aria-hidden viewBox="0 0 32 32" {...stylex.props(mascotStyles.mascot)}>
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
