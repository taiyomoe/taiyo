import { scene } from "@/components/scene/scene.stylex"
import * as stylex from "@stylexjs/stylex"

const STAR_SLOTS = [0, 1, 2, 3, 4]
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
    {STAR_SLOTS.map((slot) => (
      <svg
        key={slot}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        sx={[styles.star, slot < filled && styles.starFilled]}
      >
        <path d="M12 2.6l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.9 6.2 20.1l1.3-6.3L2.7 9.2l6.4-.7L12 2.6z" />
      </svg>
    ))}
  </span>
)
