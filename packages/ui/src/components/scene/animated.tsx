import type { CSSProperties, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"

/**
 * A scene layer driven by one of the global `scene-*` keyframes in scene.css.
 *
 * Those keyframes are global rather than `stylex.keyframes()` handles because
 * several pages share them. StyleX's `animationName`
 * only accepts a handle, so the animation has to ride the inline `style` prop —
 * which means merging it with whatever `stylex.props()` emits, every time.
 * This is that merge, written once.
 */
export const Animated = ({
  sx,
  animation,
  style,
  children,
}: {
  sx: Sx
  animation?: string
  style?: CSSProperties
  children?: ReactNode
}) => {
  const props = stylex.props(sx)

  return (
    <div className={props.className} style={{ ...props.style, ...style, animation }}>
      {children}
    </div>
  )
}
