import * as stylex from "@stylexjs/stylex"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"

const TONES = [colors.chart1, colors.chart5, colors.chart3, colors.chart2, colors.chart4]
const styles = stylex.create({
  tile: {
    borderRadius: radius.lg,
    alignItems: "center",
    display: "inline-flex",
    flexShrink: 0,
    fontWeight: 700,
    justifyContent: "center",
    letterSpacing: "-0.02em",
  },
  sm: {
    borderRadius: radius.md,
    fontSize: "0.875rem",
    height: "2.5rem",
    width: "2.5rem",
  },
  lg: {
    borderRadius: radius.xxl,
    fontSize: "1.75rem",
    height: "5.5rem",
    width: "5.5rem",
  },
  person: {
    flexShrink: 0,
    height: "2.25rem",
    width: "2.25rem",
  },
  personFallback: {
    color: colors.background,
    fontSize: "0.875rem",
    fontWeight: 700,
  },
})
const toneFor = (id: string) =>
  TONES[Number.parseInt(id.replace(/-/g, "").slice(0, 8), 16) % TONES.length] ?? colors.primary

export function GroupAvatar({
  id,
  name,
  size = "sm",
}: {
  id: string
  name: string
  size?: "sm" | "lg"
}) {
  const tone = toneFor(id)

  return (
    <span
      aria-hidden
      style={{
        backgroundColor: `color-mix(in srgb, ${tone} 20%, ${colors.card})`,
        color: `color-mix(in srgb, ${tone} 75%, ${colors.foreground})`,
      }}
      sx={[styles.tile, size === "sm" ? styles.sm : styles.lg]}
    >
      {name
        .split(/\s+/)
        .filter((word) => word !== "")
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("")}
    </span>
  )
}

export function PersonAvatar({
  person,
}: {
  person: { id: string; displayUsername: string; image: string | null }
}) {
  return (
    <Avatar sx={styles.person}>
      {person.image === null || person.image === "" ? null : (
        <AvatarImage alt="" src={person.image} />
      )}
      <AvatarFallback style={{ backgroundColor: toneFor(person.id) }} sx={styles.personFallback}>
        {person.displayUsername.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
