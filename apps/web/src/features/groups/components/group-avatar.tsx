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

export function GroupAvatar({
  id,
  name,
  logoUrl = null,
  size = "sm",
  sx,
}: {
  id: string
  name: string
  logoUrl?: string | null
  size?: "xs" | "sm" | "lg"
  sx?: Sx
}) {
  const tone = toneFor(id)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  return (
    <span
      aria-hidden
      style={{
        backgroundColor: `color-mix(in srgb, ${tone} 20%, ${colors.card})`,
        color: `color-mix(in srgb, ${tone} 75%, ${colors.foreground})`,
      }}
      sx={[styles.tile, styles[size], sx]}
    >
      {name
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
  sx,
  fallbackSx,
}: {
  person: {
    id: string
    displayUsername: string
    image: string | null
    avatarBorder?: string | null | undefined
  }
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
          style={{ backgroundColor: toneFor(person.id) }}
          sx={[styles.personFallback, fallbackSx]}
        >
          {person.displayUsername.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </AvatarBorder>
  )
}
