import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { AvatarBorder } from "@/components/avatar-border/avatar-border"

const TONES = [colors.chart1, colors.chart5, colors.chart3, colors.chart2, colors.chart4]
const styles = stylex.create({
  tile: {
    borderRadius: radius.lg,
    overflow: "hidden",
    alignItems: "center",
    display: "inline-flex",
    flexShrink: 0,
    fontWeight: 700,
    justifyContent: "center",
    letterSpacing: "-0.02em",
    position: "relative",
  },
  logo: {
    inset: 0,
    objectFit: "cover",
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  xs: {
    borderRadius: radius.sm,
    fontSize: "0.625rem",
    height: "1.75rem",
    width: "1.75rem",
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
    fontSize: "0.875rem",
    height: "2.25rem",
    width: "2.25rem",
  },
  personFallback: {
    color: colors.background,
    fontSize: "inherit",
    fontWeight: 700,
  },
})

export const toneFor = (id: string) =>
  TONES[Number.parseInt(id.replace(/-/g, "").slice(0, 8), 16) % TONES.length] ?? colors.primary

/** Up to two initials: the first letters of the first two words, or the first two of one word. */
export const initialsOf = (name: string) => {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word !== "")
  const letters =
    words.length === 1
      ? Array.from(words[0] ?? "").slice(0, 2)
      : words.map((word) => word.charAt(0))

  return letters.slice(0, 2).join("").toUpperCase()
}

/** The lit tile behind the initials of a person or group without an image, for showcase spots. */
export const glowingFallback = (tone: string) => ({
  backgroundImage: `radial-gradient(120% 120% at 30% 20%, color-mix(in oklch, ${tone} 55%, ${colors.card}), color-mix(in oklch, ${tone} 18%, ${colors.card}) 70%)`,
  color: colors.foreground,
  textShadow: "0 1px 8px rgb(0 0 0 / 35%)",
})

export function GroupAvatar({
  id,
  name,
  logoUrl = null,
  size = "sm",
  glow = false,
  sx,
}: {
  id: string
  name: string
  logoUrl?: string | null
  size?: "xs" | "sm" | "lg"
  /** Lights the initials tile, for showcase spots such as the ranking podium. */
  glow?: boolean
  sx?: Sx
}) {
  const tone = toneFor(id)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  return (
    <span
      aria-hidden
      style={
        glow
          ? glowingFallback(tone)
          : {
              backgroundColor: `color-mix(in srgb, ${tone} 20%, ${colors.card})`,
              color: `color-mix(in srgb, ${tone} 75%, ${colors.foreground})`,
            }
      }
      sx={[styles.tile, styles[size], sx]}
    >
      {glow
        ? initialsOf(name)
        : name
            .split(/\s+/)
            .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
            .filter((word) => word !== "")
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join("")}
      {logoUrl === null || logoUrl === failedUrl ? null : (
        <img
          alt=""
          onError={() => {
            setFailedUrl(logoUrl)
          }}
          ref={(image) => {
            if (image?.complete === true && image.naturalWidth === 0) {
              setFailedUrl(logoUrl)
            }
          }}
          src={logoUrl}
          sx={styles.logo}
        />
      )}
    </span>
  )
}

export function PersonAvatar({
  person,
  glow = false,
  sx,
  fallbackSx,
}: {
  person: {
    id: string
    displayUsername: string
    image: string | null
    avatarBorder?: string | null | undefined
  }
  /** Lights the initials fallback, for showcase spots such as the ranking podium. */
  glow?: boolean
  sx?: Sx
  fallbackSx?: Sx
}) {
  return (
    <AvatarBorder border={person.avatarBorder}>
      <Avatar sx={[styles.person, sx]}>
        {person.image === null || person.image === "" ? null : (
          <AvatarImage alt="" src={person.image} />
        )}
        <AvatarFallback
          style={
            glow ? glowingFallback(toneFor(person.id)) : { backgroundColor: toneFor(person.id) }
          }
          sx={[styles.personFallback, fallbackSx]}
        >
          {glow
            ? initialsOf(person.displayUsername)
            : person.displayUsername.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </AvatarBorder>
  )
}
