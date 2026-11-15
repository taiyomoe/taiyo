import * as stylex from "@stylexjs/stylex"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { renderWithName } from "@/components/user-name/with-name"
import { useClientValue } from "@/hooks/use-client-value"
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
      [breakpoints.md]: "2.75rem",
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

export function DashboardIntro({
  name,
  nameEffect,
  subtitle,
}: {
  name: string
  nameEffect: string | null | undefined
  subtitle: string
}) {
  const hour = useClientValue(() => new Date().getHours())
  let greeting = m.dashboard_greeting

  if (hour !== null && hour >= 5 && hour < 12) {
    greeting = m.dashboard_greeting_morning
  } else if (hour !== null && hour >= 12 && hour < 18) {
    greeting = m.dashboard_greeting_afternoon
  } else if (hour !== null) {
    greeting = m.dashboard_greeting_evening
  }

  return (
    <div sx={styles.intro}>
      <h1 sx={styles.title}>{renderWithName(greeting, { displayUsername: name, nameEffect })}</h1>
      <p sx={styles.subtitle}>{subtitle}</p>
    </div>
  )
}
