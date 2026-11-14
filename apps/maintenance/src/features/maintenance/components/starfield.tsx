import * as stylex from "@stylexjs/stylex"
import { scene } from "@taiyomoe/ui/styles/scene.stylex"

const STARS = [
  ["1px", "8% 14%", scene.paper],
  ["1px", "22% 32%", scene.goldPale],
  ["1.5px", "34% 9%", scene.paper],
  ["1px", "47% 22%", scene.paper],
  ["1px", "63% 12%", scene.goldPale],
  ["1.5px", "76% 28%", scene.paper],
  ["1px", "88% 8%", scene.paper],
  ["1px", "93% 41%", scene.goldPale],
  ["1px", "4% 46%", scene.paper],
  ["1px", "12% 24%", scene.goldPale],
  ["1px", "58% 4%", scene.paper],
  ["1px", "82% 18%", scene.paper],
] as const
const styles = stylex.create({
  root: {
    inset: 0,
    opacity: 0.5,
    pointerEvents: "none",
    position: "absolute",
  },
})

export const Starfield = () => (
  <div
    sx={styles.root}
    style={{
      backgroundImage: STARS.map(
        ([size, at, color]) => `radial-gradient(${size} ${size} at ${at}, ${color}, transparent)`,
      ).join(", "),
    }}
  />
)
