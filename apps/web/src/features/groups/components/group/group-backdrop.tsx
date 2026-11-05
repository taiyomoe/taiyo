import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Group } from "@/features/groups/api/groups"
import { toneFor } from "@/features/groups/components/group-avatar"
import { MediaBackdrop } from "@/features/media/components/media-page/media-backdrop"

const styles = stylex.create({
  tone: (tone: string) => ({
    backgroundImage: `radial-gradient(120% 140% at 85% 0%, color-mix(in srgb, ${tone} 70%, ${colors.warning}) 0%, transparent 60%), linear-gradient(115deg, color-mix(in srgb, ${tone} 80%, black) 0%, ${tone} 55%, color-mix(in srgb, ${tone} 75%, ${colors.warning}) 100%)`,
  }),
  wash: {
    inset: 0,
    opacity: 0.9,
    position: "absolute",
  },
})

export function GroupBackdrop({ group }: { group: Group }) {
  if (group.banner !== null && group.banner !== "") {
    return <MediaBackdrop src={group.banner} />
  }

  return (
    <MediaBackdrop src={null}>
      <div sx={[styles.wash, styles.tone(toneFor(group.id))]} />
    </MediaBackdrop>
  )
}
