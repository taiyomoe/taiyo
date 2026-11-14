import * as stylex from "@stylexjs/stylex"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"
import { sceneFont, scene } from "@taiyomoe/ui/styles/scene.stylex"
import { font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { env } from "@/env/client"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  header: {
    gap: "1rem",
    paddingBlock: "1.5rem",
    paddingInline: "clamp(1.25rem,4vw,3rem)",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 2,
  },
  lockup: {
    gap: "0.75rem",
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "23px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  discord: {
    borderColor: `color-mix(in srgb, ${scene.goldPale} 16%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: "1px",
    paddingInline: "1.125rem",
    alignItems: "center",
    backgroundColor: {
      default: `color-mix(in srgb, ${scene.goldPale} 8%, transparent)`,
      ":hover": `color-mix(in srgb, ${scene.goldPale} 12%, transparent)`,
    },
    color: {
      default: scene.goldPale,
      ":hover": scene.paper,
    },
    display: "inline-flex",
    fontFamily: font.sans,
    fontSize: "0.875rem",
    fontWeight: 500,
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "background-color, color",
    minHeight: "2.75rem",
  },
})

export const MaintenanceHeader = () => (
  <header sx={styles.header}>
    <TaiyoLogoLockup sx={styles.lockup} />
    {env.VITE_DISCORD_INVITE_URL === undefined ? null : (
      <a href={env.VITE_DISCORD_INVITE_URL} target="_blank" rel="noreferrer" sx={styles.discord}>
        {m.maintenance_discord()}
      </a>
    )}
  </header>
)
