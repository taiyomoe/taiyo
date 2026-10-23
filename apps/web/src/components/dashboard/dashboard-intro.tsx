import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { sceneFont } from "@/components/scene/scene.stylex"
import { useClientValue } from "@/lib/use-client-value"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  intro: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: {
      default: "2rem",
      "@media (width >= 48rem)": "2.75rem",
    },
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "1.0625rem",
    lineHeight: 1.5,
  },
})

type DashboardIntroProps = {
  name: string
  subtitle: string
}

export function DashboardIntro({ name, subtitle }: DashboardIntroProps) {
  const hour = useClientValue(() => new Date().getHours())
  let greeting = m.dashboard_greeting({ name })

  if (hour !== null && hour >= 5 && hour < 12) {
    greeting = m.dashboard_greeting_morning({ name })
  } else if (hour !== null && hour >= 12 && hour < 18) {
    greeting = m.dashboard_greeting_afternoon({ name })
  } else if (hour !== null) {
    greeting = m.dashboard_greeting_evening({ name })
  }

  return (
    <div sx={styles.intro}>
      <h1 sx={styles.title}>{greeting}</h1>
      <p sx={styles.subtitle}>{subtitle}</p>
    </div>
  )
}
