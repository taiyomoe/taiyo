import * as stylex from "@stylexjs/stylex"
import { Check } from "@taiyomoe/ui/components/icons"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Group } from "@/features/groups/api/groups"
import { toneFor } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  frame: {
    containerType: "inline-size",
    position: "relative",
    width: "100%",
  },
  disc: (tone: string) => ({
    borderColor: colors.background,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: "clamp(3px, 2.5cqi, 6px)",
    overflow: "hidden",
    alignItems: "center",
    aspectRatio: "1",
    backgroundImage: `radial-gradient(circle at 70% 25%, color-mix(in srgb, ${colors.warning} 75%, ${tone}) 0%, transparent 45%), linear-gradient(160deg, color-mix(in srgb, ${tone} 80%, black), ${tone} 60%, color-mix(in srgb, ${tone} 70%, ${colors.warning}))`,
    boxShadow: shadows.overlay,
    color: "white",
    display: "flex",
    fontFamily: sceneFont.display,
    fontSize: "34cqi",
    fontWeight: font.weightBold,
    justifyContent: "center",
    letterSpacing: "-0.03em",
    lineHeight: 1,
    textShadow: "0 2px 12px rgb(0 0 0 / 0.25)",
    width: "100%",
  }),
  logo: {
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
  badge: {
    borderColor: colors.background,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: "clamp(2px, 1.5cqi, 4px)",
    alignItems: "center",
    backgroundColor: colors.warning,
    boxShadow: shadows.raised,
    color: `color-mix(in srgb, black 75%, ${colors.warning})`,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    bottom: "9%",
    height: "20%",
    right: "9%",
    width: "20%",
  },
  check: {
    height: "50%",
    width: "50%",
  },
})

export function GroupEmblem({ group }: { group: Group }) {
  const initials = group.name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word !== "")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")

  return (
    <div sx={styles.frame}>
      <div aria-hidden sx={styles.disc(toneFor(group.id))}>
        {group.logoUrl === null ? (
          initials
        ) : (
          <img alt="" decoding="async" src={group.logoUrl} sx={styles.logo} />
        )}
      </div>
      {group.owned ? (
        <span
          role="img"
          aria-label={m.group_verified()}
          sx={styles.badge}
          title={m.group_verified()}
        >
          <Check sx={styles.check} />
        </span>
      ) : null}
    </div>
  )
}
