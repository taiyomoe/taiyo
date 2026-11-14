import * as stylex from "@stylexjs/stylex"
import { scene, sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, font } from "@taiyomoe/ui/styles/tokens.stylex"

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)"
const styles = stylex.create({
  row: {
    paddingBlock: "clamp(1.75rem,3.5vw,2.75rem)",
    columnGap: "clamp(1rem,3vw,2.5rem)",
    display: "grid",
    gridTemplateColumns: {
      default: "3rem minmax(0,1fr)",
      [breakpoints.md]: "5rem minmax(0,1.05fr) minmax(0,1fr)",
    },
    position: "relative",
    rowGap: "0.875rem",
    borderTopColor: `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
  },
  number: {
    color: {
      default: `color-mix(in srgb, ${scene.paper} 34%, transparent)`,
      ":is(:hover > *)": scene.brand,
    },
    fontFamily: font.mono,
    fontSize: "0.875rem",
    transitionDuration: "300ms",
    transitionProperty: "color",
    paddingTop: "0.625rem",
  },
  title: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(1.75rem, 3.4vw, 2.875rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.025em",
    lineHeight: 1.04,
    textWrap: "balance",
    transform: {
      default: "none",
      ":is(:hover > *)": "translateX(0.75rem)",
    },
    transitionDuration: "500ms",
    transitionProperty: "transform",
    transitionTimingFunction: EASE,
  },
  body: {
    margin: 0,
    gridColumn: { default: "2", [breakpoints.md]: "3" },
    color: {
      default: `color-mix(in srgb, ${scene.paper} 52%, transparent)`,
      ":is(:hover > *)": `color-mix(in srgb, ${scene.paper} 78%, transparent)`,
    },
    fontSize: "1rem",
    lineHeight: 1.65,
    textWrap: "pretty",
    transitionDuration: "300ms",
    transitionProperty: "color",
    paddingTop: { default: 0, [breakpoints.md]: "0.5rem" },
  },
  sweep: {
    backgroundImage: `linear-gradient(90deg, ${scene.brand}, ${scene.gold} 60%, transparent)`,
    position: "absolute",
    transform: {
      default: "scaleX(0)",
      ":is(:hover > *)": "scaleX(1)",
    },
    transformOrigin: "left",
    transitionDuration: "700ms",
    transitionProperty: "transform",
    transitionTimingFunction: EASE,
    height: "1px",
    left: 0,
    right: 0,
    top: "-1px",
  },
})

export const ReasonRow = ({
  number,
  title,
  body,
}: {
  number: number
  title: string
  body: string
}) => (
  <article sx={styles.row}>
    <span sx={styles.sweep} />
    <span sx={styles.number}>{String(number).padStart(2, "0")}</span>
    <h3 sx={styles.title}>{title}</h3>
    <p sx={styles.body}>{body}</p>
  </article>
)
