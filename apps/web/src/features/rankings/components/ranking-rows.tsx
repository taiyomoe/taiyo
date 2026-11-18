import type { CSSVariables, Sx } from "@taiyomoe/ui/styles/sx"
import type { MouseEvent, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  colors,
  consts,
  containers,
  font,
  motion,
  radius,
  shadows,
} from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { RankingCategory } from "@/features/rankings/lib/rankings"
import { RankingChip, RankingTag } from "@/features/rankings/components/ranking-chips"
import { EntryLink } from "@/features/rankings/components/ranking-entry-link"
import { RankingThumb } from "@/features/rankings/components/ranking-thumb"
import { flame } from "@/features/rankings/lib/podium.stylex"
import {
  formatCount,
  formatMetric,
  type RankedEntry,
  type RankedStanding,
} from "@/features/rankings/lib/ranking-entries"
import { m } from "@/paraglide/messages"

const COMET_LENGTH = 8
// The tail first, so the head paints on top.
const COMET = Array.from({ length: COMET_LENGTH }, (_, index) => COMET_LENGTH - 1 - index)
const travel = stylex.keyframes({
  from: { offsetDistance: "0%" },
  to: { offsetDistance: "100%" },
})
const enter = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(28px)" },
  to: { opacity: 1, transform: "none" },
})
const styles = stylex.create({
  list: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    gap: "1rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
    paddingBottom: "0.375rem",
  },
  rule: {
    flex: "1",
    backgroundImage: `linear-gradient(90deg, ${colors.border}, transparent)`,
    height: "1px",
  },
  // The thumbnails of a row: avatars and logos at `--thumb`, covers at `--cover-w`×`--cover-h`.
  // StyleX drops conditions on custom properties, so the sizes follow the board's width instead.
  sizes: {
    "--cover-h": "clamp(3.5rem, 6.2cqi, 4.125rem)",
    "--cover-w": "clamp(2.5rem, 4.4cqi, 2.9375rem)",
    "--thumb": "clamp(2.5rem, 5cqi, 3.375rem)",
  },
  row: {
    borderRadius: radius.xxl,
    gap: { default: "0.75rem", [containers.lg]: "1.25rem" },
    overflow: "hidden",
    paddingBlock: { default: "0.75rem", [containers.lg]: "1rem" },
    alignItems: "center",
    animationDelay: "var(--delay)",
    animationDuration: "700ms",
    animationFillMode: "backwards",
    animationName: enter,
    animationTimingFunction: motion.easeOut,
    backgroundColor: colors.card,
    boxShadow: {
      default: `${shadows.raised}, inset 0 0 0 1px ${colors.border}`,
      ":hover": `${shadows.raised}, inset 0 0 0 1px rgb(242 69 45 / 35%)`,
    },
    display: "flex",
    isolation: "isolate",
    position: "relative",
    transform: { default: "none", ":hover": "translateY(-2px)" },
    transitionDuration: "240ms",
    transitionProperty: "transform, box-shadow",
    transitionTimingFunction: motion.easeOut,
    paddingLeft: { default: "0.75rem", [containers.lg]: "1rem" },
    paddingRight: { default: "1rem", [containers.lg]: "1.5rem" },
  },
  spot: {
    inset: 0,
    backgroundImage:
      "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgb(242 69 45 / 18%), transparent 60%)",
    opacity: { default: 0, [stylex.when.ancestor(":hover")]: 1 },
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: "240ms",
    transitionProperty: "opacity",
    transitionTimingFunction: motion.easeOut,
    zIndex: -1,
  },
  rank: {
    color: "oklch(70% 0 0)",
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: { default: "1rem", [containers.lg]: "1.25rem" },
    fontWeight: 700,
    lineHeight: "1.5rem",
    textAlign: "center",
    width: { default: "1.75rem", [containers.lg]: "2.5rem" },
  },
  thumbLink: {
    borderRadius: radius.lg,
    display: "flex",
    flexShrink: 0,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  body: {
    gap: "0.5rem",
    display: "flex",
    flexBasis: "auto",
    flexDirection: "column",
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  head: {
    alignItems: "center",
    columnGap: "0.625rem",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "0.375rem",
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    color: colors.foreground,
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: "1.375rem",
    textDecorationLine: { default: "none", ":hover": "underline" },
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
    minWidth: 0,
  },
  meter: {
    alignItems: "center",
    columnGap: "0.75rem",
    display: "flex",
    flexWrap: { default: "wrap", [containers.lg]: "nowrap" },
    rowGap: "0.25rem",
  },
  track: {
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    flexBasis: { default: "100%", [containers.lg]: "20rem" },
    flexGrow: { default: 1, [containers.lg]: 0 },
    flexShrink: 1,
    height: "6px",
  },
  bar: {
    borderRadius: radius.full,
    backgroundImage: `linear-gradient(90deg, ${flame.deep}, ${colors.primary} 40%, ${flame.amber})`,
    boxShadow: "0 0 12px rgb(242 69 45 / 60%)",
    display: "block",
    height: "100%",
  },
  sub: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    lineHeight: "1rem",
    whiteSpace: "nowrap",
  },
  // The metric sits at the end of the row on wide boards, and on the bar's line on narrow ones.
  metricEnd: {
    display: { default: "none", [containers.lg]: "block" },
  },
  metricInline: {
    display: { default: "block", [containers.lg]: "none" },
    marginLeft: "auto",
  },
  metricStart: {
    marginLeft: 0,
  },
  metric: {
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: { default: "0.875rem", [containers.lg]: "1.25rem" },
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    lineHeight: "1.5rem",
    whiteSpace: "nowrap",
  },
  frame: {
    padding: "1.5px",
    borderRadius: radius.xxl,
    backgroundColor: `color-mix(in oklch, ${colors.primary} 45%, transparent)`,
    boxShadow: "0 12px 40px -16px rgb(242 69 45 / 60%)",
    isolation: "isolate",
    position: "relative",
    marginTop: "0.875rem",
  },
  // Only the border ring of the frame: the content box is cut out of the mask.
  beamTrack: {
    inset: 0,
    padding: "1.5px",
    borderRadius: "inherit",
    display: { default: "block", [consts.reducedMotion]: "none" },
    maskClip: "content-box, border-box",
    maskComposite: "exclude",
    maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
    pointerEvents: "none",
    position: "absolute",
  },
  // A comet that travels along the border at a constant speed: a gradient rotating around the
  // center would race through the corners of such a wide card. It is a trail of round glows, which
  // look the same at any angle, so the light keeps its length through the corners.
  glow: {
    borderRadius: "50%",
    animationDuration: "6s",
    animationIterationCount: "infinite",
    animationName: travel,
    animationTimingFunction: "linear",
    offsetPath: `rect(0 auto auto 0 round ${radius.xxl})`,
    offsetRotate: "0deg",
    position: "absolute",
    height: "4rem",
    width: "4rem",
  },
  glowAt: (index: number) => ({
    animationDelay: `${index * -40}ms`,
    backgroundImage: `radial-gradient(closest-side, ${index === 0 ? flame.amber : colors.primary}, transparent)`,
    opacity: 1 - index / COMET_LENGTH,
  }),
  me: {
    borderRadius: `calc(${radius.xxl} - 1.5px)`,
    gap: { default: "0.75rem", [containers.lg]: "1.25rem" },
    paddingBlock: { default: "0.75rem", [containers.lg]: "1rem" },
    alignItems: "center",
    backgroundImage: `linear-gradient(90deg, color-mix(in oklch, ${colors.primary} 22%, ${colors.card}), color-mix(in oklch, ${colors.primary} 6%, ${colors.card}) 70%)`,
    display: "flex",
    paddingLeft: { default: "0.75rem", [containers.lg]: "1rem" },
    paddingRight: { default: "1rem", [containers.lg]: "1.5rem" },
  },
  meRank: {
    color: flame.peach,
    fontSize: { default: "0.875rem", [containers.lg]: "1rem" },
    minWidth: { default: "1.75rem", [containers.lg]: "2.5rem" },
    width: "auto",
  },
  meThumb: {
    boxShadow: `0 0 0 2px ${flame.orange}, 0 0 18px rgb(242 69 45 / 60%)`,
  },
  meBody: {
    gap: "0.25rem",
  },
  meName: {
    fontWeight: 700,
  },
  meSub: {
    color: "oklch(80% 0 0)",
    fontSize: "0.8125rem",
    lineHeight: "1.125rem",
  },
  invite: {
    flexWrap: "wrap",
  },
  inviteIcon: {
    borderRadius: radius.lg,
    alignItems: "center",
    backgroundImage: `linear-gradient(135deg, ${flame.deep}, ${flame.orange})`,
    color: "white",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "2.5rem",
    width: "2.5rem",
  },
  inviteText: {
    gap: "0.25rem",
    display: "flex",
    flexBasis: "14rem",
    flexDirection: "column",
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  inviteTitle: {
    fontSize: "0.9375rem",
    fontWeight: 700,
    lineHeight: "1.375rem",
  },
})
const trackPointer = (event: MouseEvent<HTMLElement>) => {
  const bounds = event.currentTarget.getBoundingClientRect()

  event.currentTarget.style.setProperty("--mx", `${event.clientX - bounds.left}px`)
  event.currentTarget.style.setProperty("--my", `${event.clientY - bounds.top}px`)
}

export function RankingRows({
  entries,
  category,
  progress,
  children,
}: {
  entries: readonly RankedEntry[]
  category: RankingCategory
  progress: number
  children?: ReactNode
}) {
  const top = entries[0]?.value ?? 0
  const rest = entries.slice(3)
  const last = rest.at(-1)

  return (
    <section sx={[styles.list, styles.sizes]}>
      {last === undefined ? null : (
        <div sx={styles.heading}>
          <span>{m.rankings_rest_heading({ first: "4", last: String(last.rank) })}</span>
          <span aria-hidden sx={styles.rule} />
        </div>
      )}
      <ol sx={styles.list}>
        {rest.map((entry, index) => {
          const row = stylex.props(styles.row, stylex.defaultMarker())
          const rowStyle: CSSVariables = { ...row.style, "--delay": `${420 + index * 70}ms` }
          const share = top === 0 ? 0 : (entry.value / top) * 100 * progress
          const metric = formatMetric(category, Math.round(entry.value * progress))

          return (
            <li
              key={entry.id}
              className={row.className}
              onMouseMove={trackPointer}
              style={rowStyle}
            >
              <span aria-hidden sx={styles.spot} />
              <span sx={styles.rank}>{entry.rank}</span>
              <EntryLink entry={entry} sx={styles.thumbLink}>
                <RankingThumb thumb={entry.thumb} />
              </EntryLink>
              <div sx={styles.body}>
                <div sx={styles.head}>
                  <EntryLink entry={entry} sx={styles.name} />
                  <RankingChip label={entry.chip} />
                  <RankingTag tag={entry.tag} />
                </div>
                <div sx={styles.meter}>
                  <span aria-hidden sx={styles.track}>
                    <span style={{ width: `${share.toFixed(1)}%` }} sx={styles.bar} />
                  </span>
                  <span sx={styles.sub}>{entry.sub}</span>
                  <span sx={[styles.metric, styles.metricInline]}>{metric}</span>
                </div>
              </div>
              <span sx={[styles.metric, styles.metricEnd]}>{metric}</span>
            </li>
          )
        })}
      </ol>
      {children}
    </section>
  )
}

function Frame({ children, sx }: { children: ReactNode; sx?: Sx }) {
  return (
    <div sx={styles.frame}>
      <div sx={[styles.me, sx]}>{children}</div>
      <span aria-hidden sx={styles.beamTrack}>
        {COMET.map((index) => (
          <span key={index} sx={[styles.glow, styles.glowAt(index)]} />
        ))}
      </span>
    </div>
  )
}

export function StandingRow({
  standing,
  category,
  progress,
}: {
  standing: RankedStanding
  category: RankingCategory
  progress: number
}) {
  const metric = formatMetric(category, Math.round(standing.value * progress))

  return (
    <Frame>
      <span sx={[styles.rank, styles.meRank]}>#{formatCount(standing.rank)}</span>
      <RankingThumb sx={styles.meThumb} thumb={standing.thumb} />
      <div sx={[styles.body, styles.meBody]}>
        <div sx={styles.head}>
          <span sx={[styles.name, styles.meName]}>
            {category === "readers" ? m.rankings_me_label() : standing.name}
          </span>
          {standing.chip === null ? null : <RankingChip label={standing.chip} />}
        </div>
        <span sx={styles.meSub}>{standing.sub}</span>
        <span sx={[styles.metric, styles.metricInline, styles.metricStart]}>{metric}</span>
      </div>
      <span sx={[styles.metric, styles.metricEnd]}>{metric}</span>
    </Frame>
  )
}

export function StandingInvite({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action: { label: string; to: "/latest" }
}) {
  return (
    <Frame sx={styles.invite}>
      <span aria-hidden sx={styles.inviteIcon}>
        {icon}
      </span>
      <div sx={styles.inviteText}>
        <span sx={styles.inviteTitle}>{title}</span>
        <span sx={styles.meSub}>{description}</span>
      </div>
      <Button render={<Link to={action.to} />} size="sm">
        {action.label}
      </Button>
    </Frame>
  )
}
