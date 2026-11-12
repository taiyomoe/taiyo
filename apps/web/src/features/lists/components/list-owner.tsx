import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { ListSummary } from "@/features/lists/api/lists"
import { AvatarBorder } from "@/components/avatar-border/avatar-border"
import { UserName } from "@/components/user-name/user-name"

const styles = stylex.create({
  owner: {
    borderRadius: radius.sm,
    gap: "0.5rem",
    textDecoration: "none",
    alignItems: "center",
    color: {
      default: `color-mix(in srgb, ${colors.foreground} 82%, transparent)`,
      ":hover": colors.foreground,
    },
    display: "inline-flex",
    fontSize: "0.8125rem",
    fontWeight: 500,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "relative",
    transitionDuration: "150ms",
    transitionProperty: "color",
    zIndex: 1,
    minWidth: 0,
  },
  avatar: {
    fontSize: "0.625rem",
    fontWeight: 700,
    height: "1.375rem",
    width: "1.375rem",
  },
  avatarLarge: {
    fontSize: "0.75rem",
    height: "1.75rem",
    width: "1.75rem",
  },
  avatarFallback: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 22%, ${colors.card})`,
    color: `color-mix(in srgb, ${colors.primary} 70%, ${colors.foreground})`,
  },
  name: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function ListOwner({
  owner,
  size = "sm",
  sx,
}: {
  owner: ListSummary["owner"]
  size?: "sm" | "lg"
  sx?: Sx
}) {
  return (
    <Link
      params={{ username: owner.username }}
      to="/users/$username"
      {...stylex.props(styles.owner, sx)}
    >
      <AvatarBorder border={owner.avatarBorder}>
        <Avatar sx={[styles.avatar, size === "lg" && styles.avatarLarge]}>
          {owner.image === null ? null : <AvatarImage alt="" src={owner.image} />}
          <AvatarFallback sx={styles.avatarFallback}>
            {owner.displayUsername.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </AvatarBorder>
      <UserName effect={owner.nameEffect} name={owner.displayUsername} sx={styles.name} />
    </Link>
  )
}
