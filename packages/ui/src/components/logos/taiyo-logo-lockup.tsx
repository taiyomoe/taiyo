import type { ComponentProps } from "react"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { font, text } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"
import { TaiyoLogo } from "./taiyo-logo"

const styles = stylex.create({
  root: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontFamily: font.heading,
    fontSize: text.xl,
  },
  mark: {
    height: "1.4em",
    width: "auto",
  },
})

export const TaiyoLogoLockup = ({
  className,
  sx,
  ...props
}: ComponentProps<"div"> & {
  sx?: Sx
}) => {
  const styleProps = stylex.props(styles.root, sx)

  return (
    <div className={cn(styleProps.className, className)} style={styleProps.style} {...props}>
      <TaiyoLogo {...stylex.props(styles.mark)} />
      <span>Taiyō</span>
    </div>
  )
}
