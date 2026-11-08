import * as stylex from "@stylexjs/stylex"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { AvatarBorder } from "@/components/avatar-border/avatar-border"
import { getTone, initialOf } from "@/features/activity-log/lib/avatar-tones"

const styles = stylex.create({
  avatar: (size: string) => ({
    flexShrink: 0,
    fontSize: `calc(${size} * 0.42)`,
    fontWeight: 700,
    height: size,
    width: size,
  }),
  fallback: (color: string) => ({
    backgroundColor: color,
    color: colors.primaryForeground,
  }),
})

export function PersonAvatar({
  name,
  image,
  seed,
  size = "2rem",
  border,
}: {
  name: string
  image: string | null
  seed: string
  size?: string
  border?: string | null | undefined
}) {
  return (
    <AvatarBorder border={border}>
      <Avatar sx={styles.avatar(size)}>
        {image === null || image === "" ? null : <AvatarImage alt="" src={image} />}
        <AvatarFallback sx={styles.fallback(getTone(seed))}>{initialOf(name)}</AvatarFallback>
      </Avatar>
    </AvatarBorder>
  )
}
