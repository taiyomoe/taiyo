import * as stylex from "@stylexjs/stylex"
import { Embers } from "@taiyomoe/ui/components/scene/embers"
import { LandingSun } from "@taiyomoe/ui/components/scene/landing-sun"
import { sceneFont, scene } from "@taiyomoe/ui/styles/scene.stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useRef } from "react"
import { env } from "@/env/client"
import { Countdown } from "@/features/maintenance/components/countdown"
import { MaintenanceHeader } from "@/features/maintenance/components/maintenance-header"
import { Starfield } from "@/features/maintenance/components/starfield"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    overflow: "hidden",
    backgroundImage: `radial-gradient(ellipse 90% 70% at 50% 100%, ${scene.ink} 0%, ${scene.nightRaised} 34%, ${scene.night} 60%, ${scene.nightDeep} 100%)`,
    color: scene.paper,
    display: "flex",
    flexDirection: "column",
    fontFamily: font.sans,
    position: "relative",
    touchAction: "pan-y pinch-zoom",
    minHeight: "100dvh",
  },
  main: {
    gap: "1.25rem",
    paddingInline: "clamp(1.25rem,4vw,3rem)",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "center",
    position: "relative",
    textAlign: "center",
    zIndex: 1,
    paddingBottom: "clamp(10rem, 28vh, 20rem)",
    paddingTop: "clamp(1.5rem, 5vh, 4rem)",
  },
  title: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.75rem, 7vw, 6.5rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.03em",
    lineHeight: 1,
    textWrap: "balance",
    maxWidth: "56.25rem",
  },
  subtitle: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 70%, transparent)`,
    fontSize: "clamp(0.9375rem, 1.3vw, 1.0625rem)",
    lineHeight: 1.6,
    textWrap: "pretty",
    maxWidth: "35rem",
  },
})
const endsAt =
  env.VITE_MAINTENANCE_ENDS_AT === undefined ? null : Date.parse(env.VITE_MAINTENANCE_ENDS_AT)

export const MaintenancePage = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={pageRef} data-maintenance sx={styles.page}>
      <Starfield />
      <LandingSun surfaceRef={pageRef} />
      <Embers count={30} />
      <MaintenanceHeader />
      <main sx={styles.main}>
        <h1 sx={styles.title}>{m.maintenance_title()}</h1>
        <p sx={styles.subtitle}>
          {endsAt === null ? m.maintenance_subtitle_no_countdown() : m.maintenance_subtitle()}
        </p>
        {endsAt === null ? null : <Countdown endsAt={endsAt} />}
      </main>
    </div>
  )
}
