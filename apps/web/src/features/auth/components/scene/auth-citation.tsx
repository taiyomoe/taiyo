import * as stylex from "@stylexjs/stylex"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { scene } from "@/components/scene/scene.stylex"
import { Stars } from "@/components/scene/stars"

const styles = stylex.create({
  slide: {
    textShadow: "0 2px 18px rgba(10,5,3,0.7)",
    minHeight: "11.75rem",
  },
  quote: {
    color: scene.paper,
    fontFamily: font.heading,
    fontSize: "clamp(24px, 2.4vw, 34px)",
    fontStyle: "italic",
    fontWeight: 700,
    lineHeight: 1.22,
    textWrap: "balance",
    marginBottom: "1.375rem",
    marginTop: "1rem",
  },
  author: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  avatar: {
    borderRadius: radius.full,
    alignItems: "center",
    backgroundImage: `linear-gradient(140deg, ${scene.brand}, ${scene.gold})`,
    color: scene.ink,
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: font.heading,
    fontSize: text.lg,
    fontWeight: 700,
    justifyContent: "center",
    height: "2.625rem",
    width: "2.625rem",
  },
  identity: {
    lineHeight: 1.25,
  },
  who: {
    fontWeight: 700,
  },
  role: {
    color: `color-mix(in srgb, ${scene.paper} 55%, transparent)`,
    fontSize: "13px",
  },
})

type AuthCitationProps = {
  rating: number
  quote: string
  who: string
  role: string
}

export const AuthCitation = ({ rating, quote, who, role }: AuthCitationProps) => (
  <div sx={styles.slide}>
    <Stars filled={rating} />
    <p sx={styles.quote}>{`“${quote}”`}</p>
    <div sx={styles.author}>
      <span sx={styles.avatar}>{who.charAt(0).toUpperCase()}</span>
      <div sx={styles.identity}>
        <div sx={styles.who}>{who}</div>
        <div sx={styles.role}>{role}</div>
      </div>
    </div>
  </div>
)
