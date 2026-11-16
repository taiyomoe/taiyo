import * as stylex from "@stylexjs/stylex"
import { consts } from "@taiyomoe/ui/styles/tokens.stylex"
import { useHydrated } from "@tanstack/react-router"
import { useEffect } from "react"
import { CautionTape } from "@/features/media/components/media-lockdown/caution-tape"
import { DmcaPlacard } from "@/features/media/components/media-lockdown/dmca-placard"
import { useLockdownSounds } from "@/features/media/hooks/use-lockdown-sounds"
import {
  LOCKDOWN_IMPACT,
  LOCKDOWN_PLACARD,
  LOCKDOWN_TAPES,
} from "@/features/media/lib/lockdown-timeline"

const dim = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})
const shake = stylex.keyframes({
  "0%": { translate: "0 0" },
  "18%": { translate: "-0.5rem 0.3rem" },
  "36%": { translate: "0.45rem -0.35rem" },
  "54%": { translate: "-0.3rem 0.2rem" },
  "72%": { translate: "0.15rem -0.1rem" },
  "100%": { translate: "0 0" },
})
const styles = stylex.create({
  // Starts under the floating navbar, so the backdrop behind it dims too.
  root: {
    inset: 0,
    overflow: "hidden",
    containerType: "size",
    position: "absolute",
    zIndex: 1,
    top: "calc(-1 * var(--navbar-height))",
  },
  dim: {
    inset: 0,
    animationDuration: "600ms",
    animationFillMode: "both",
    animationName: { default: dim, [consts.reducedMotion]: "none" },
    animationTimingFunction: "ease-out",
    backdropFilter: "grayscale(0.8) blur(2px)",
    backgroundImage:
      "radial-gradient(120% 120% at 50% 50%, rgb(10 10 10 / 0.45), rgb(10 10 10 / 0.8))",
    position: "absolute",
  },
  stage: {
    inset: 0,
    animationDuration: "380ms",
    animationFillMode: "both",
    animationName: { default: shake, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    position: "absolute",
  },
  impact: (delay: string) => ({
    animationDelay: delay,
  }),
})

function Cue({ onMount }: { onMount: () => void }) {
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- plays once, as the tape mounts
  useEffect(onMount, [])

  return null
}

/**
 * Tapes the page off like a crime scene and slams a DMCA placard onto it. The
 * strips and the placard only mount once the page is interactive and the
 * sounds are loaded, so the sounds start in step with them.
 */
export function MediaLockdown({
  mediaId,
  title,
  canEdit,
}: {
  mediaId: string
  title: string
  canEdit: boolean
}) {
  const hydrated = useHydrated()
  const soundtrack = useLockdownSounds(hydrated)

  return (
    <div sx={styles.root}>
      <div sx={styles.dim} />
      {soundtrack.ready ? (
        <div sx={[styles.stage, styles.impact(`${LOCKDOWN_IMPACT}ms`)]}>
          <Cue onMount={soundtrack.play} />
          <div aria-hidden>
            {LOCKDOWN_TAPES.map((tape) => (
              <CautionTape key={tape.placement} {...tape} />
            ))}
          </div>
          <DmcaPlacard
            canEdit={canEdit}
            delay={LOCKDOWN_PLACARD.delay}
            duration={LOCKDOWN_PLACARD.duration}
            impact={LOCKDOWN_IMPACT}
            mediaId={mediaId}
            title={title}
          />
        </div>
      ) : null}
    </div>
  )
}
