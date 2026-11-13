import type { CSSProperties, ReactNode } from "react"
import { TaiyoLogo } from "@taiyomoe/ui/components/logos/taiyo-logo"
import sun from "@/features/og/assets/sun.webp?inline"
import { OG_HEIGHT, OG_WIDTH, ogColors, ogFonts } from "@/features/og/lib/og-theme"

// sun.webp is 1600px wide around a disc of radius 160px: the beams reach five
// radii out, so the picture is ten radii across.
const SUN_SPAN = 10
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" })

/** The first letter of a name, to stand in for a missing picture. */
export const getInitial = (name: string) =>
  [...graphemes.segment(name.trim())].at(0)?.segment.toUpperCase() ?? "?"

export type OgSunPlace = { x: number; y: number; radius: number }

/** The landing page's plasma sun, its disc centred on `x`, `y`. */
const OgSun = ({ x, y, radius }: OgSunPlace) => (
  <img
    src={sun}
    alt=""
    style={{
      position: "absolute",
      left: x - (radius * SUN_SPAN) / 2,
      top: y - (radius * SUN_SPAN) / 2,
      width: radius * SUN_SPAN,
      height: radius * SUN_SPAN,
    }}
  />
)

/**
 * The card itself: the landing page's night sky, tinted by the page's own
 * picture when it has one, and lit by the sun at `sun`. Its light spreads
 * across the whole card, and warms the left edge the text starts from.
 */
export const OgCanvas = ({
  sun: place,
  backdrop,
  children,
}: {
  sun: OgSunPlace
  backdrop?: string | null
  children: ReactNode
}) => (
  <div
    style={{
      display: "flex",
      overflow: "hidden",
      position: "relative",
      width: OG_WIDTH,
      height: OG_HEIGHT,
      backgroundColor: ogColors.night,
      backgroundImage: `radial-gradient(120% 95% at 85% 100%, ${ogColors.nightRaised} 0%, ${ogColors.night} 55%, ${ogColors.nightDeep} 100%)`,
      color: ogColors.paper,
      fontFamily: ogFonts.body,
    }}
  >
    {backdrop === null || backdrop === undefined ? null : (
      <>
        <img
          src={backdrop}
          alt=""
          style={{
            position: "absolute",
            left: -80,
            top: -80,
            width: OG_WIDTH + 160,
            height: OG_HEIGHT + 160,
            objectFit: "cover",
            filter: "blur(40px) saturate(1.3)",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(100deg, ${ogColors.night} 0%, rgba(18, 10, 7, 0.88) 42%, rgba(18, 10, 7, 0.45) 100%)`,
          }}
        />
      </>
    )}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: [
          `radial-gradient(circle 1100px at ${place.x}px ${place.y}px, rgba(255, 184, 32, 0.3) 0%, rgba(251, 110, 84, 0.13) 38%, transparent 72%)`,
          "radial-gradient(60% 95% at 0% 50%, rgba(255, 184, 32, 0.2) 0%, rgba(242, 69, 45, 0.08) 45%, transparent 80%)",
        ].join(", "),
      }}
    />
    <OgSun {...place} />
    {children}
  </div>
)

/** Taiyō's mark and name, with the site's host after it. */
export const OgBrand = ({ host, style }: { host: string; style?: CSSProperties }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, ...style }}>
    <TaiyoLogo width={52} height={33} />
    <span
      style={{
        fontFamily: ogFonts.display,
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: "-0.02em",
      }}
    >
      Taiyō
    </span>
    <span style={{ fontSize: 22, color: ogColors.paperFaint, marginLeft: 4 }}>{host}</span>
  </div>
)

export const OgEyebrow = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: "flex",
      color: ogColors.goldLight,
      fontSize: 19,
      fontWeight: 700,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    {children}
  </div>
)

export const OgChip = ({ children, icon }: { children: ReactNode; icon?: ReactNode }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 18px",
      borderRadius: 999,
      border: `1px solid ${ogColors.hairline}`,
      backgroundColor: "rgba(255, 252, 248, 0.07)",
      color: ogColors.paperMuted,
      fontSize: 20,
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}
  >
    {icon}
    {children}
  </div>
)

/** A row of chips: `countFirstRow` picks how many of them fit on one line. */
export const OgChips = ({ children, width }: { children: ReactNode; width?: number }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, width }}>{children}</div>
)

export const OgStat = ({ value, label }: { value: string; label: string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span
      style={{
        fontFamily: ogFonts.display,
        fontSize: 46,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "-0.02em",
      }}
    >
      {value}
    </span>
    <span
      style={{
        color: ogColors.paperFaint,
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  </div>
)

/** A display title at the size `fitText` picked, clamped to `lines` lines past it. */
export const OgTitle = ({
  children,
  size,
  lines,
  color = ogColors.paper,
}: {
  children: string
  size: number
  lines: number
  color?: string
}) => (
  <div
    style={{
      color,
      fontFamily: ogFonts.display,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.06,
      letterSpacing: "-0.025em",
      overflowWrap: "anywhere",
      lineClamp: lines,
      textOverflow: "ellipsis",
      overflow: "hidden",
      textWrap: "balance",
    }}
  >
    {children}
  </div>
)

export const OgText = ({
  children,
  size = 24,
  lines = 1,
  color = ogColors.paperMuted,
  weight = 400,
}: {
  children: ReactNode
  size?: number
  lines?: number
  color?: string
  weight?: number
}) => (
  <div
    style={{
      color,
      fontSize: size,
      fontWeight: weight,
      lineHeight: 1.4,
      textOverflow: "ellipsis",
      overflow: "hidden",
      // One line never wraps, so a long unbroken name ends in an ellipsis
      // instead of breaking before it and leaving only its first word.
      ...(lines === 1 ? { whiteSpace: "nowrap" } : { overflowWrap: "anywhere", lineClamp: lines }),
    }}
  >
    {children}
  </div>
)

/**
 * A picture with a soft frame, or the sun's gradient behind Taiyō's mark when
 * there is none.
 */
export const OgPicture = ({
  src,
  width,
  height,
  radius,
  label,
  fallback = (
    <TaiyoLogo
      width={width * 0.42}
      height={width * 0.27}
      style={{ filter: "brightness(0)", opacity: 0.22 }}
    />
  ),
  style,
}: {
  src: string | null
  width: number
  height: number
  radius: number
  label?: string | null
  fallback?: ReactNode
  style?: CSSProperties
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
      flexShrink: 0,
      width,
      height,
      borderRadius: radius,
      backgroundImage: `radial-gradient(circle at 50% 35%, ${ogColors.goldPale} 0%, ${ogColors.gold} 40%, ${ogColors.brand} 78%, #c8301c 100%)`,
      boxShadow: `0 30px 70px rgba(5, 2, 1, 0.6), 0 0 0 1px ${ogColors.hairline}`,
      ...style,
    }}
  >
    {src === null ? (
      fallback
    ) : (
      <img
        src={src}
        alt=""
        style={{
          width,
          height,
          objectFit: "cover",
          // A labelled picture is one not every viewer opted into: it stays a blur.
          ...(label === null || label === undefined
            ? {}
            : { filter: "blur(30px) brightness(0.8)", transform: "scale(1.25)" }),
        }}
      />
    )}
    {label === null || label === undefined ? null : (
      <div
        style={{
          position: "absolute",
          padding: "10px 22px",
          borderRadius: 999,
          backgroundColor: "rgba(18, 10, 7, 0.72)",
          border: `1px solid ${ogColors.hairline}`,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    )}
  </div>
)
