import * as stylex from "@stylexjs/stylex"
import { AlertTriangle } from "@taiyomoe/ui/components/icons"
import { breakpoints, consts, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { hazard } from "@/features/media/components/media-lockdown/lockdown.stylex"
import { m } from "@/paraglide/messages"

const slam = stylex.keyframes({
  "0%": { opacity: 0, rotate: "-11deg", scale: "2.1", translate: "0 -10%" },
  "60%": { opacity: 1, rotate: "-1.5deg", scale: "0.95", translate: "0 0" },
  "80%": { rotate: "-3deg", scale: "1.025" },
  "100%": { opacity: 1, rotate: "-2.5deg", scale: "1", translate: "0 0" },
})
const shockwave = stylex.keyframes({
  "0%": { opacity: 0, scale: "0.8" },
  "4%": { opacity: 0.85 },
  "100%": { opacity: 0, scale: "1.55" },
})
const styles = stylex.create({
  layer: {
    inset: 0,
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
    position: "absolute",
  },
  frame: {
    pointerEvents: "auto",
    position: "relative",
    width: "min(35rem, 100%)",
  },
  shockwave: {
    inset: 0,
    borderColor: hazard.yellow,
    borderRadius: "1.5rem",
    borderStyle: "solid",
    borderWidth: "3px",
    animationDuration: "650ms",
    animationFillMode: "both",
    animationName: { default: shockwave, [consts.reducedMotion]: "none" },
    animationTimingFunction: "cubic-bezier(0.2, 0.7, 0.3, 1)",
    opacity: 0,
    position: "absolute",
  },
  sign: {
    padding: "0.75rem",
    borderRadius: "1.5rem",
    animationFillMode: "both",
    animationName: { default: slam, [consts.reducedMotion]: "none" },
    animationTimingFunction: "cubic-bezier(0.55, 0, 0.35, 1)",
    backgroundColor: hazard.yellow,
    backgroundImage: hazard.thinStripes,
    boxShadow:
      "0 2.5rem 4rem -1rem rgb(0 0 0 / 0.75), 0 0.75rem 1.5rem rgb(0 0 0 / 0.45), inset 0 1px 0 rgb(255 255 255 / 0.35)",
    position: "relative",
    rotate: "-2.5deg",
  },
  panel: {
    borderRadius: "0.75rem",
    gap: "0.75rem",
    paddingInline: { default: "1.25rem", [breakpoints.sm]: "2.25rem" },
    alignItems: "center",
    backgroundColor: hazard.yellow,
    backgroundImage:
      "radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 0.28), transparent 60%), linear-gradient(180deg, transparent 70%, rgb(0 0 0 / 0.08))",
    boxShadow: "inset 0 0 0 2px rgb(0 0 0 / 0.85), inset 0 2px 0 3px rgb(255 255 255 / 0.25)",
    color: hazard.black,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    textAlign: "center",
    paddingBottom: "1.75rem",
    paddingTop: "1.5rem",
  },
  rivet: {
    borderRadius: "50%",
    backgroundImage:
      "radial-gradient(circle at 35% 30%, #fffbe6 0 18%, #a8a39a 32%, #4d4a44 70%, #2a2825 100%)",
    boxShadow: "0 1px 1px rgb(0 0 0 / 0.5)",
    position: "absolute",
    height: "0.625rem",
    width: "0.625rem",
  },
  topLeft: { left: "0.75rem", top: "0.75rem" },
  topRight: { right: "0.75rem", top: "0.75rem" },
  bottomLeft: { bottom: "0.75rem", left: "0.75rem" },
  bottomRight: { bottom: "0.75rem", right: "0.75rem" },
  eyebrow: {
    margin: 0,
    borderRadius: "999px",
    gap: "0.5rem",
    paddingBlock: "0.375rem",
    paddingInline: "0.875rem",
    alignItems: "center",
    backgroundColor: hazard.black,
    color: hazard.yellow,
    display: "inline-flex",
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: "clamp(4.5rem, 17cqmin, 8.5rem)",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    lineHeight: 0.85,
    paddingInlineEnd: "0.05em",
    textShadow: "0 2px 0 rgb(255 255 255 / 0.35)",
  },
  description: {
    margin: 0,
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: 1.5,
    textWrap: "pretty",
    maxWidth: "26rem",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "0.25rem",
  },
  action: {
    borderColor: hazard.black,
    borderRadius: "999px",
    borderStyle: "solid",
    borderWidth: "2px",
    paddingInline: "1.125rem",
    textDecoration: "none",
    alignItems: "center",
    display: "inline-flex",
    fontSize: "0.875rem",
    fontWeight: 700,
    transitionDuration: "150ms",
    transitionProperty: "background-color, color",
    height: "2.5rem",
  },
  primary: {
    backgroundColor: {
      default: hazard.black,
      ":hover": "#2c2c2c",
    },
    color: hazard.yellow,
  },
  secondary: {
    backgroundColor: {
      default: "transparent",
      ":hover": "rgb(0 0 0 / 0.08)",
    },
    color: hazard.black,
  },
  timing: (delay: string, duration: string) => ({
    animationDelay: delay,
    animationDuration: duration,
  }),
})

export function DmcaPlacard({
  mediaId,
  title,
  canEdit,
  delay,
  duration,
  impact,
}: {
  mediaId: string
  title: string
  canEdit: boolean
  delay: number
  duration: number
  impact: number
}) {
  return (
    <div sx={styles.layer}>
      <div sx={styles.frame}>
        <div aria-hidden sx={[styles.shockwave, styles.timing(`${impact}ms`, "650ms")]} />
        <section
          aria-label={m.media_locked_label({ title })}
          sx={[styles.sign, styles.timing(`${delay}ms`, `${duration}ms`)]}
        >
          <div sx={styles.panel}>
            <span aria-hidden sx={[styles.rivet, styles.topLeft]} />
            <span aria-hidden sx={[styles.rivet, styles.topRight]} />
            <span aria-hidden sx={[styles.rivet, styles.bottomLeft]} />
            <span aria-hidden sx={[styles.rivet, styles.bottomRight]} />
            <p sx={styles.eyebrow}>
              <AlertTriangle size={14} />
              {m.media_locked_eyebrow()}
              <AlertTriangle size={14} />
            </p>
            <h2 sx={styles.title}>DMCA</h2>
            <p sx={styles.description}>{m.media_locked_description()}</p>
            <div sx={styles.actions}>
              <Link {...stylex.props(styles.action, styles.primary)} to="/dmca">
                {m.media_locked_policy()}
              </Link>
              {canEdit ? (
                <Link
                  params={{ mediaId }}
                  {...stylex.props(styles.action, styles.secondary)}
                  to="/media/$mediaId/edit"
                >
                  {m.media_locked_edit()}
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
