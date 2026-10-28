import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { scene } from "@/components/scene/scene.stylex"

const styles = stylex.create({
  eyebrow: {
    borderColor: `color-mix(in srgb, ${scene.gold} 22%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: "1px",
    gap: "0.5625rem",
    paddingBlock: "0.4375rem",
    paddingInline: "0.9375rem",
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${scene.gold} 8%, transparent)`,
    display: "inline-flex",
  },
  eyebrowCentered: {
    alignSelf: "center",
  },
  eyebrowDot: {
    borderRadius: "50%",
    backgroundColor: scene.gold,
    boxShadow: `0 0 10px ${scene.gold}`,
    height: "0.375rem",
    width: "0.375rem",
  },
  eyebrowLabel: {
    color: scene.goldLight,
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
})

export const Eyebrow = ({
  children,
  centered = false,
}: {
  children: ReactNode
  centered?: boolean
}) => (
  <div sx={[styles.eyebrow, centered && styles.eyebrowCentered]}>
    <span sx={styles.eyebrowDot} />
    <span sx={styles.eyebrowLabel}>{children}</span>
  </div>
)
