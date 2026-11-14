import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { scene } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { AuthScene } from "@/features/auth/components/scene/auth-scene"

const styles = stylex.create({
  screen: {
    overflow: "hidden",
    backgroundColor: scene.night,
    color: scene.paper,
    display: "grid",
    gridTemplateColumns: { [breakpoints.lg]: "1.05fr 0.95fr", default: null },
    height: "100svh",
  },
  panel: {
    paddingBlock: "2rem",
    paddingInline: "clamp(28px,5vw,76px)",
    backgroundImage: "linear-gradient(180deg, #1b0f0a, #150c08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    scrollbarWidth: "none",
    height: "100svh",
    overflowY: "auto",
  },
  column: {
    marginInline: "auto",
    maxWidth: "26.875rem",
    width: "100%",
  },
})

export const AuthScreen = ({ children }: { children: ReactNode }) => (
  <div data-auth-screen sx={styles.screen}>
    <AuthScene />
    <div sx={styles.panel}>
      <div sx={styles.column}>{children}</div>
    </div>
  </div>
)
