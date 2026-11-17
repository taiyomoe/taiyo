import type { CSSVariables } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Embers } from "@taiyomoe/ui/components/scene/embers"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { colors, containers, font, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import type { RankedEntry } from "@/features/rankings/lib/ranking-entries"
import type { RankingCategory } from "@/features/rankings/lib/rankings"
import { RankingTag } from "@/features/rankings/components/ranking-chips"
import { EntryLink } from "@/features/rankings/components/ranking-entry-link"
import { RankingThumb } from "@/features/rankings/components/ranking-thumb"
import { metal } from "@/features/rankings/lib/podium.stylex"
import { formatMetric } from "@/features/rankings/lib/ranking-entries"
import { spinning } from "@/features/rankings/lib/spinning"
import { m } from "@/paraglide/messages"

type Place = "gold" | "silver" | "bronze"

/** The podium reads 2–1–3: each step, by the index of its entry. */
const STEPS = [
  { index: 1, place: "silver", delay: 140, spin: 7 },
  { index: 0, place: "gold", delay: 0, spin: 4.5 },
  { index: 2, place: "bronze", delay: 280, spin: 8 },
] as const satisfies ReadonlyArray<{ index: number; place: Place; delay: number; spin: number }>
const enter = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(28px)" },
  to: { opacity: 1, transform: "none" },
})
const breathe = stylex.keyframes({
  "0%, 100%": { opacity: 0.7 },
  "50%": { opacity: 1 },
})
const bob = stylex.keyframes({
  "0%, 100%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-7px)" },
})
const sweep = stylex.keyframes({
  "0%": { transform: "translateX(-130%) skewX(-18deg)" },
  "100%": { transform: "translateX(260%) skewX(-18deg)" },
})
const styles = stylex.create({
  // `--px` is one pixel of the 1024px-wide design, scaled down with the width the board gets (to half
  // at most): every size of the podium is a multiple of it.
  root: {
    "--px": "clamp(0.5px, 100cqi / 1024, 1px)",
    alignItems: "end",
    columnGap: "calc(24 * var(--px))",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    position: "relative",
    paddingTop: "calc(72 * var(--px))",
  },
  round: {
    "--thumb": "calc(116 * var(--px))",
    "--thumb-h": "var(--thumb)",
  },
  cover: {
    "--cover-h": "calc(136 * var(--px))",
    "--cover-w": "calc(98 * var(--px))",
    "--thumb-h": "var(--cover-h)",
  },
  beam: {
    animationDuration: "5s",
    animationIterationCount: "infinite",
    animationName: breathe,
    animationTimingFunction: "ease-in-out",
    filter: "blur(16px)",
    pointerEvents: "none",
    position: "absolute",
    transform: "translateX(-50%)",
    zIndex: 0,
    height: "calc(560 * var(--px))",
    left: "50%",
    top: "-40px",
    width: "min(100%, calc(560 * var(--px)))",
    "::before": {
      inset: 0,
      backgroundImage:
        "linear-gradient(180deg, rgb(255 236 180 / 0%) 0%, rgb(255 222 150 / 16%) 45%, rgb(255 205 110 / 22%) 80%, rgb(255 200 100 / 4%) 100%)",
      clipPath: "polygon(41% 0, 59% 0, 100% 100%, 0 100%)",
      content: "''",
      position: "absolute",
    },
  },
  beamCore: {
    animationDirection: "reverse",
    filter: "blur(7px)",
    height: "calc(520 * var(--px))",
    width: "calc(200 * var(--px))",
    "::before": {
      inset: 0,
      backgroundImage:
        "linear-gradient(180deg, rgb(255 245 210 / 0%), rgb(255 240 200 / 14%) 55%, rgb(255 230 170 / 0%))",
      clipPath: "polygon(44% 0, 56% 0, 100% 100%, 0 100%)",
      content: "''",
      position: "absolute",
    },
  },
  embers: {
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
    zIndex: 0,
  },
  column: {
    alignItems: "center",
    animationDelay: "var(--delay)",
    animationDuration: "900ms",
    animationFillMode: "backwards",
    animationName: enter,
    animationTimingFunction: motion.easeOut,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 1,
    minWidth: 0,
  },
  crown: {
    animationDuration: "3s",
    animationIterationCount: "infinite",
    animationName: bob,
    animationTimingFunction: "ease-in-out",
    display: "flex",
    filter: "drop-shadow(0 6px 18px rgb(245 182 42 / 60%))",
    height: "calc(36 * max(var(--px), 0.7px))",
    marginBottom: "calc(10 * var(--px))",
    width: "calc(44 * max(var(--px), 0.7px))",
  },
  thumbLink: {
    borderRadius: "inherit",
    display: "flex",
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  ring: {
    padding: "5px",
    boxSizing: "border-box",
    display: "flex",
    position: "relative",
    zIndex: 2,
    marginBottom: "calc((var(--thumb-h) + 10px) / -2)",
  },
  ringRound: {
    borderRadius: "9999px",
  },
  ringSquare: {
    borderRadius: "calc(var(--thumb) * 0.28 + 5px)",
  },
  ringCover: {
    borderRadius: "calc(var(--cover-h) * 0.1 + 5px)",
  },
  thumb: {
    boxShadow: `0 0 0 3px ${colors.background}`,
  },
  border: {
    padding: "1.5px",
    boxSizing: "border-box",
    maskImage: "linear-gradient(#000 55%, transparent)",
    position: "relative",
    borderTopLeftRadius: "calc(40 * var(--px) + 1.5px)",
    borderTopRightRadius: "calc(40 * var(--px) + 1.5px)",
    width: "100%",
  },
  face: {
    overflow: "hidden",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    position: "relative",
    borderTopLeftRadius: "calc(40 * var(--px))",
    borderTopRightRadius: "calc(40 * var(--px))",
    height: "calc(var(--face) * var(--px))",
    paddingTop: "calc(var(--thumb-h) / 2 + 34 * var(--px))",
    "::after": {
      animationDuration: "900ms",
      animationName: {
        default: "none",
        [stylex.when.ancestor(":hover")]: sweep,
      },
      animationTimingFunction: motion.easeOut,
      backgroundImage: "linear-gradient(90deg, transparent, rgb(255 255 255 / 10%), transparent)",
      content: "''",
      pointerEvents: "none",
      position: "absolute",
      transform: "translateX(-130%) skewX(-18deg)",
      bottom: 0,
      left: 0,
      top: 0,
      width: "40%",
    },
  },
  number: {
    alignItems: "flex-start",
    backgroundClip: "text",
    color: "transparent",
    display: "flex",
    fontFamily: sceneFont.display,
    fontSize: "calc(var(--number) * var(--px))",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  hash: {
    fontSize: "0.4em",
    marginRight: "0.04em",
    marginTop: "0.14em",
  },
  floor: {
    backgroundImage: `linear-gradient(90deg, transparent, rgb(245 182 42 / 70%) 30%, ${metal.gold2} 50%, rgb(245 182 42 / 70%) 70%, transparent)`,
    boxShadow: "0 0 28px 3px rgb(245 182 42 / 35%)",
    gridColumnEnd: "-1",
    gridColumnStart: "1",
    position: "relative",
    zIndex: 1,
    height: "2px",
  },
  pool: {
    borderRadius: "50%",
    animationDuration: "5s",
    animationIterationCount: "infinite",
    animationName: breathe,
    animationTimingFunction: "ease-in-out",
    backgroundImage:
      "radial-gradient(ellipse at center, rgb(255 214 120 / 45%) 0%, rgb(245 166 35 / 18%) 40%, transparent 70%)",
    filter: "blur(8px)",
    pointerEvents: "none",
    position: "absolute",
    transform: "translateX(-50%)",
    height: "calc(92 * var(--px))",
    left: "50%",
    top: "calc(-46 * var(--px))",
    width: "min(100%, calc(560 * var(--px)))",
  },
  info: {
    gap: "calc(10 * var(--px))",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    textAlign: "center",
    zIndex: 1,
    minWidth: 0,
    paddingTop: "calc(22 * var(--px))",
  },
  name: {
    overflow: "hidden",
    color: colors.foreground,
    display: "block",
    fontSize: {
      default: "0.9375rem",
      [containers.md]: "1.125rem",
      [containers["3xl"]]: "1.375rem",
    },
    fontWeight: 700,
    lineHeight: 1.3,
    textDecorationLine: { default: "none", ":hover": "underline" },
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  chips: {
    gap: "0.375rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  chip: {
    borderRadius: "9999px",
    paddingInline: "0.625rem",
    alignItems: "center",
    display: "inline-flex",
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
    whiteSpace: "nowrap",
    height: "1.5rem",
  },
  metric: {
    backgroundClip: "text",
    color: "transparent",
    fontFamily: font.mono,
    fontSize: {
      default: "0.75rem",
      [containers.md]: "1.125rem",
      [containers["3xl"]]: "1.3125rem",
    },
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    overflowWrap: "break-word",
    maxWidth: "100%",
  },
  metricFirst: {
    fontSize: {
      default: "0.8125rem",
      [containers.md]: "1.375rem",
      [containers["3xl"]]: "1.625rem",
    },
  },
  sub: {
    color: colors.mutedForeground,
    fontSize: { default: "0.75rem", [containers.md]: "0.8125rem" },
    lineHeight: "1.125rem",
  },
  vacant: {
    borderColor: `color-mix(in srgb, ${colors.foreground} 18%, transparent)`,
    borderRadius: "9999px",
    borderStyle: "dashed",
    borderWidth: 1.5,
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 3%, transparent)`,
    boxSizing: "border-box",
    position: "relative",
    zIndex: 2,
    height: "calc(var(--thumb-h) + 10px)",
    marginBottom: "calc((var(--thumb-h) + 10px) / -2)",
    width: "calc(var(--thumb-h) + 10px)",
  },
  vacantFace: {
    filter: "grayscale(1)",
    opacity: 0.35,
  },
  vacantLabel: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontStyle: "italic",
  },
})
const places = stylex.create({
  gold: {
    "--chip-text": metal.gold1,
    "--face": "310",
    "--glow": metal.goldGlow,
    "--metal": `linear-gradient(180deg, ${metal.gold1} 0%, ${metal.gold2} 35%, ${metal.gold3} 70%, ${metal.gold4} 100%)`,
    "--number": "132",
    "--ring": `conic-gradient(from var(--ranking-angle), ${metal.gold1}, ${metal.gold2}, ${metal.gold4}, ${metal.gold3}, ${metal.gold1}, ${metal.gold2}, ${metal.gold4}, ${metal.gold1})`,
  },
  silver: {
    "--chip-text": metal.silver1,
    "--face": "240",
    "--glow": metal.silverGlow,
    "--metal": `linear-gradient(180deg, ${metal.silver1} 0%, ${metal.silver2} 35%, ${metal.silver3} 70%, ${metal.silver4} 100%)`,
    "--number": "96",
    "--ring": `conic-gradient(from var(--ranking-angle), ${metal.silver1}, ${metal.silver2}, ${metal.silver4}, ${metal.silver3}, ${metal.silver1}, ${metal.silver2}, ${metal.silver4}, ${metal.silver1})`,
  },
  bronze: {
    "--chip-text": metal.bronze1,
    "--face": "200",
    "--glow": metal.bronzeGlow,
    "--metal": `linear-gradient(180deg, ${metal.bronze1} 0%, ${metal.bronze2} 35%, ${metal.bronze3} 70%, ${metal.bronze4} 100%)`,
    "--number": "80",
    "--ring": `conic-gradient(from var(--ranking-angle), ${metal.bronze1}, ${metal.bronze2}, ${metal.bronze4}, ${metal.bronze3}, ${metal.bronze1}, ${metal.bronze2}, ${metal.bronze4}, ${metal.bronze1})`,
  },
})
const lit = stylex.create({
  ring: {
    backgroundImage: "var(--ring)",
    filter: "drop-shadow(0 12px 32px color-mix(in oklch, var(--glow) 55%, transparent))",
  },
  border: {
    backgroundImage:
      "conic-gradient(from var(--ranking-angle), transparent 0deg, var(--glow) 50deg, transparent 110deg, transparent 180deg, var(--glow) 230deg, transparent 290deg), linear-gradient(180deg, color-mix(in oklch, var(--glow) 55%, transparent), transparent 80%)",
  },
  borderFirst: {
    boxShadow: "0 -24px 80px -24px color-mix(in oklch, var(--glow) 70%, transparent)",
  },
  face: {
    backgroundImage: `radial-gradient(120% 70% at 50% 0%, color-mix(in oklch, var(--glow) 32%, transparent) 0%, transparent 62%), linear-gradient(180deg, color-mix(in oklch, var(--glow) 12%, ${colors.card}) 0%, ${colors.background} 100%)`,
  },
  number: {
    backgroundImage: "var(--metal)",
    filter: "drop-shadow(0 10px 30px color-mix(in oklch, var(--glow) 50%, transparent))",
  },
  chip: {
    backgroundColor: "color-mix(in oklch, var(--glow) 16%, transparent)",
    boxShadow: "inset 0 0 0 1px color-mix(in oklch, var(--glow) 42%, transparent)",
    color: "var(--chip-text)",
  },
  metric: {
    backgroundImage: "var(--metal)",
  },
})

function Crown() {
  return (
    <svg aria-hidden sx={styles.crown} viewBox="0 0 44 36">
      <defs>
        <linearGradient id="ranking-crown" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={metal.gold1} />
          <stop offset="0.45" stopColor={metal.gold2} />
          <stop offset="1" stopColor="#c47a0e" />
        </linearGradient>
      </defs>
      <path
        d="M4 11l9 8 9-15 9 15 9-8-3.5 19h-29L4 11Z"
        fill="url(#ranking-crown)"
        stroke={metal.gold1}
        strokeLinejoin="round"
        strokeWidth="1"
      />
      <circle cx="4" cy="10" fill={metal.gold2} r="2.6" />
      <circle cx="22" cy="4" fill={metal.gold2} r="2.6" />
      <circle cx="40" cy="10" fill={metal.gold2} r="2.6" />
      <rect fill="url(#ranking-crown)" height="3.5" rx="1.75" width="30" x="7" y="31" />
    </svg>
  )
}

function Step({
  entry,
  rank,
  place,
  delay,
  spin,
  category,
}: {
  entry: RankedEntry | undefined
  rank: number
  place: Place
  delay: number
  spin: number
  category: RankingCategory
}) {
  const shape = { readers: styles.ringRound, groups: styles.ringSquare, titles: styles.ringCover }[
    category
  ]
  const column = stylex.props(styles.column, places[place])
  const columnStyle: CSSVariables = { ...column.style, "--delay": `${delay}ms` }

  return (
    <div className={column.className} style={columnStyle}>
      {place === "gold" && entry !== undefined ? <Crown /> : null}
      {entry === undefined ? (
        <span aria-hidden sx={styles.vacant} />
      ) : (
        <div {...spinning([styles.ring, shape, lit.ring], spin - 1)}>
          <EntryLink entry={entry} sx={styles.thumbLink}>
            <RankingThumb sx={styles.thumb} thumb={entry.thumb} />
          </EntryLink>
        </div>
      )}
      <div
        {...spinning(
          [
            styles.border,
            lit.border,
            place === "gold" && lit.borderFirst,
            stylex.defaultMarker(),
            entry === undefined && styles.vacantFace,
          ],
          spin,
        )}
      >
        <div sx={[styles.face, lit.face]}>
          <div aria-hidden sx={[styles.number, lit.number]}>
            <span sx={styles.hash}>#</span>
            <span>{rank}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepInfo({
  entry,
  place,
  category,
  progress,
}: {
  entry: RankedEntry | undefined
  place: Place
  category: RankingCategory
  progress: number
}) {
  if (entry === undefined) {
    return (
      <div sx={[styles.info, places[place]]}>
        <span sx={styles.vacantLabel}>{m.rankings_open_spot()}</span>
      </div>
    )
  }

  return (
    <div sx={[styles.info, places[place]]}>
      <EntryLink entry={entry} sx={styles.name} />
      <div sx={styles.chips}>
        <span sx={[styles.chip, lit.chip]}>{entry.chip}</span>
        <RankingTag tag={entry.tag} />
      </div>
      <span sx={[styles.metric, lit.metric, place === "gold" && styles.metricFirst]}>
        {formatMetric(category, Math.round(entry.value * progress))}
      </span>
      <span sx={styles.sub}>{entry.sub}</span>
    </div>
  )
}

export function RankingPodium({
  entries,
  category,
  progress,
}: {
  entries: readonly RankedEntry[]
  category: RankingCategory
  progress: number
}) {
  return (
    <div sx={[styles.root, category === "titles" ? styles.cover : styles.round]}>
      <div aria-hidden sx={styles.beam} />
      <div aria-hidden sx={[styles.beam, styles.beamCore]} />
      <div aria-hidden sx={styles.embers}>
        <Embers count={34} />
      </div>
      {STEPS.map((step) => (
        <Step
          key={step.place}
          category={category}
          delay={step.delay}
          entry={entries[step.index]}
          place={step.place}
          rank={step.index + 1}
          spin={step.spin}
        />
      ))}
      <div aria-hidden sx={styles.floor}>
        <div sx={styles.pool} />
      </div>
      {STEPS.map((step) => (
        <StepInfo
          key={step.place}
          category={category}
          entry={entries[step.index]}
          place={step.place}
          progress={progress}
        />
      ))}
    </div>
  )
}
