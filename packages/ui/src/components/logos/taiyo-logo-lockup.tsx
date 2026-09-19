import * as stylex from "@stylexjs/stylex"
import { ComponentProps } from "react"
import { TaiyoLogo } from "@/components/logos/taiyo-logo"
import { cn } from "@/utils/cn"
import type { Sx } from "../../styles/sx"
import { font, text } from "../../styles/tokens.stylex"

const styles = stylex.create({
  root: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: text.xl,
  },
  // The mark is sized off the lockup's own font size so the two scale
  // together: set `fontSize` on the root and the glyph follows.
  mark: {
    height: "1.4em",
    width: "auto",
  },
  wordmark: {
    fontFamily: font.heading,
  },
})

export type TaiyoLogoLockupProps = ComponentProps<"div"> & {
  sx?: Sx
}

export const TaiyoLogoLockup = ({ className, sx, ...props }: TaiyoLogoLockupProps) => {
  const styleProps = stylex.props(styles.root, sx)

  return (
    <div className={cn(styleProps.className, className)} style={styleProps.style} {...props}>
      <TaiyoLogo {...stylex.props(styles.mark)} />
      <span sx={styles.wordmark}>Taiyō</span>
    </div>
  )
}
