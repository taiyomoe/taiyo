import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { scene } from "@taiyomoe/ui/styles/scene.stylex"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  anchor: {
    display: "grid",
    position: "relative",
  },
  badge: {
    borderColor: `color-mix(in srgb, ${scene.gold} 55%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.125rem",
    paddingInline: "0.5rem",
    backgroundColor: scene.nightRaised,
    boxShadow: `0 2px 10px color-mix(in srgb, ${scene.night} 60%, transparent)`,
    color: scene.goldLight,
    fontSize: "0.6875rem",
    fontWeight: 800,
    letterSpacing: "0.02em",
    lineHeight: 1.4,
    pointerEvents: "none",
    position: "absolute",
    whiteSpace: "nowrap",
    zIndex: 1,
    right: "0.75rem",
    top: "-0.5625rem",
  },
})

/** Marks `children` with a "Last used" badge when `active`. */
export const LastUsed = ({ active, children }: { active: boolean; children: ReactNode }) => (
  <div sx={styles.anchor}>
    {children}
    {active ? <span sx={styles.badge}>{m.auth_last_used()}</span> : null}
  </div>
)
