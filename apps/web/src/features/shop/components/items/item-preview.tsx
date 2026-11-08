import type { CosmeticKind } from "@taiyomoe/db/cosmetics"
import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import { AvatarBorder } from "@/components/avatar-border/avatar-border"
import { UserName } from "@/components/user-name/user-name"
import { TitleBadge } from "@/features/users/components/profile/title-badge"

export type ShopViewer = { id: string; displayUsername: string; image: string | null }

const styles = stylex.create({
  avatar: (size: string) => ({
    boxShadow: "0 8px 24px -10px rgb(0 0 0 / 80%)",
    height: size,
    width: size,
  }),
  fallback: (size: string) => ({
    backgroundColor: "#2a2a30",
    backgroundImage: "linear-gradient(160deg, #3a3a42, #1c1c21)",
    color: "rgb(255 255 255 / 80%)",
    fontSize: `calc(${size} * 0.38)`,
    fontWeight: 650,
  }),
  name: (size: string) => ({
    overflow: "hidden",
    fontSize: `calc(${size} * 0.32)`,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  }),
})

export function ItemPreview({
  kind,
  itemKey,
  viewer,
  size = "4.5rem",
  sx,
}: {
  kind: CosmeticKind
  itemKey: string
  viewer: ShopViewer
  size?: string
  sx?: Sx
}) {
  if (kind === "AVATAR_BORDER") {
    return (
      <AvatarBorder border={itemKey}>
        <Avatar sx={[styles.avatar(size), sx]}>
          {viewer.image === null || viewer.image === "" ? null : (
            <AvatarImage alt="" src={viewer.image} />
          )}
          <AvatarFallback sx={styles.fallback(size)}>
            {viewer.displayUsername.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </AvatarBorder>
    )
  }

  if (kind === "NAME_EFFECT") {
    return <UserName effect={itemKey} name={viewer.displayUsername} sx={[styles.name(size), sx]} />
  }

  return <TitleBadge sx={sx} title={itemKey} />
}
