import * as stylex from "@stylexjs/stylex"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { Stars } from "@/components/scene/stars"

const styles = stylex.create({
  card: {
    borderColor: `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: "1px",
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${scene.paper} 5%, transparent), color-mix(in srgb, ${scene.paper} 2%, transparent))`,
    paddingBottom: "1.5rem",
    paddingLeft: "1.625rem",
    paddingRight: "1.625rem",
    paddingTop: "1.625rem",
  },
  quote: {
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: text.xl,
    fontStyle: "italic",
    fontWeight: font.weightBold,
    lineHeight: 1.32,
    textWrap: "pretty",
    marginBottom: "1.25rem",
    marginLeft: "0",
    marginRight: "0",
    marginTop: "0.9375rem",
  },
  author: {
    gap: "0.6875rem",
    alignItems: "center",
    display: "flex",
  },
  avatar: {
    borderRadius: "50%",
    alignItems: "center",
    backgroundImage: `linear-gradient(140deg, ${scene.brand}, ${scene.gold})`,
    color: scene.ink,
    display: "flex",
    flexShrink: 0,
    fontFamily: sceneFont.display,
    fontSize: "1rem",
    fontWeight: font.weightBold,
    justifyContent: "center",
    height: "2.375rem",
    width: "2.375rem",
  },
  who: {
    color: scene.paper,
    fontSize: "0.875rem",
    fontWeight: font.weightBold,
  },
  role: {
    color: `color-mix(in srgb, ${scene.paper} 50%, transparent)`,
    fontSize: "0.75rem",
  },
})

export const ReviewCard = ({ quote, who, role }: { quote: string; who: string; role: string }) => (
  <div sx={styles.card}>
    <Stars filled={1} />
    <p sx={styles.quote}>“{quote}”</p>
    <div sx={styles.author}>
      <span sx={styles.avatar}>{who.charAt(0).toUpperCase()}</span>
      <div>
        <div sx={styles.who}>{who}</div>
        <div sx={styles.role}>{role}</div>
      </div>
    </div>
  </div>
)
