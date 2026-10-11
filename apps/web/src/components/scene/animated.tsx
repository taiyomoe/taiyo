import * as stylex from "@stylexjs/stylex"
import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { CSSProperties, ReactNode } from "react"

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
