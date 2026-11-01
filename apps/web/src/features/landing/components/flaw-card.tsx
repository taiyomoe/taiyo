import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { scene, sceneFont } from "@/components/scene/scene.stylex"

const styles = stylex.create({
  card: {
    borderColor: `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: "1px",
    overflow: "hidden",
    paddingBlock: "2.125rem",
    paddingInline: "1.875rem",
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${scene.paper} 5%, transparent), color-mix(in srgb, ${scene.paper} 2%, transparent))`,
    position: "relative",
    transitionDuration: "200ms",
    transitionProperty: "transform, box-shadow",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    height: "100%",
  },
  cardHovered: {
    boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
    transform: "translateY(-5px)",
  },
  corona: {
    borderRadius: "50%",
    backgroundImage: `radial-gradient(circle, color-mix(in srgb, ${scene.brand} 50%, transparent), transparent 70%)`,
    filter: "blur(20px)",
    opacity: 0.4,
    position: "absolute",
    transitionDuration: "200ms",
    transitionProperty: "opacity",
    height: "10rem",
    right: "-2.5rem",
    top: "-3.75rem",
    width: "10rem",
  },
  coronaHovered: {
    opacity: 0.9,
  },
  body: {
    position: "relative",
    zIndex: 2,
  },
  glyph: {
    borderRadius: radius.md,
    alignItems: "center",
    backgroundImage: `linear-gradient(140deg, ${scene.brand}, ${scene.gold})`,
    boxShadow: `0 8px 22px color-mix(in srgb, ${scene.brand} 40%, transparent)`,
    color: scene.ink,
    display: "flex",
    justifyContent: "center",
    height: "3.375rem",
    marginBottom: "1.375rem",
    width: "3.375rem",
  },
  title: {
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: text.xl,
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    marginBottom: "0.625rem",
    marginLeft: "0",
    marginRight: "0",
    marginTop: "0",
  },
  text: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 60%, transparent)`,
    fontSize: text.base,
    lineHeight: 1.6,
  },
})

export const FlawCard = ({
  icon,
  title,
  body,
}: {
  icon: IconSvgElement
  title: string
  body: string
}) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      sx={[styles.card, hovered && styles.cardHovered]}
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
      }}
    >
      <div sx={[styles.corona, hovered && styles.coronaHovered]} />
      <div sx={styles.body}>
        <div sx={styles.glyph}>
          <HugeiconsIcon icon={icon} size={26} />
        </div>
        <h3 sx={styles.title}>{title}</h3>
        <p sx={styles.text}>{body}</p>
      </div>
    </div>
  )
}
