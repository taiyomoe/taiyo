import { scene } from "@/components/scene/scene.stylex"
import * as stylex from "@stylexjs/stylex"

/**
 * Hand-drawn rather than pulled from the icon set: hugeicons' free tier is
 * stroke-only, and a rating needs a SOLID star to read the filled/empty split
 * at 12–16px.
 *
 * `fill` is a StyleX style, not the SVG presentation attribute — an attribute
 * cannot resolve `var(...)`, and these colours are tokens.
 */
const styles = stylex.create({
  root: {
    gap: "0.1875rem",
    display: "inline-flex",
  },
  star: {
    fill: `color-mix(in srgb, ${scene.paper} 16%, transparent)`,
  },
  starFilled: {
    fill: scene.gold,
  },
})

export const Stars = ({ filled, size = 15 }: { filled: number; size?: number }) => (
  <span sx={styles.root} aria-hidden>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        sx={[styles.star, i < filled && styles.starFilled]}
      >
        <path d="M12 2.6l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.9 6.2 20.1l1.3-6.3L2.7 9.2l6.4-.7L12 2.6z" />
      </svg>
    ))}
  </span>
)
