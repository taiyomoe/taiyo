import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"

/**
 * Spreads `sx` with the global `ranking-spin` animation, which turns `--ranking-angle` for the
 * conic gradients of the rings and borders. StyleX cannot name a global keyframe, so it rides the
 * inline style.
 */
export const spinning = (sx: Sx, seconds: number) => {
  const props = stylex.props(sx)

  return {
    className: props.className,
    style: { ...props.style, animation: `ranking-spin ${seconds}s linear infinite` },
  }
}
