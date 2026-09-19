import * as stylex from "@stylexjs/stylex"

import { scene } from "@/components/scene/scene.stylex"

type StarsProps = {
  count: number
}

// `fill` is set through StyleX rather than the SVG presentation attribute:
// an attribute cannot resolve `var(...)`, and these colours are tokens.
const styles = stylex.create({
  root: {
    gap: "0.1875rem",
    display: "inline-flex",
  },
  star: {
    fill: "rgba(255, 255, 255, 0.18)",
  },
  starEarned: {
    fill: scene.gold,
  },
})

export const AuthCitationsRating = ({ count }: StarsProps) => (
  <span sx={styles.root}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        width="15"
        height="15"
        viewBox="0 0 24 24"
        aria-hidden
        sx={[styles.star, i < count && styles.starEarned]}
      >
        <path d="M12 2.6l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.9 6.2 20.1l1.3-6.3L2.7 9.2l6.4-.7L12 2.6z" />
      </svg>
    ))}
  </span>
)
