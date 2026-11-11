import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Group } from "@/features/groups/api/groups"
import { toneFor } from "@/features/groups/components/group-avatar"

const styles = stylex.create({
  banner: {
    overflow: "hidden",
    aspectRatio: "3 / 1",
    backgroundColor: colors.muted,
    position: "relative",
    maxHeight: "18rem",
    width: "100%",
  },
  image: {
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
  placeholder: (tone: string) => ({
    inset: 0,
    backgroundImage: `radial-gradient(120% 140% at 15% 0%, color-mix(in srgb, ${tone} 45%, transparent), transparent 60%), radial-gradient(120% 140% at 90% 100%, color-mix(in srgb, ${colors.warning} 30%, transparent), transparent 60%)`,
    position: "absolute",
  }),
  shade: {
    inset: 0,
    backgroundImage: `linear-gradient(to bottom, transparent 60%, color-mix(in srgb, ${colors.background} 45%, transparent))`,
    pointerEvents: "none",
    position: "absolute",
  },
})

export function GroupBanner({ group }: { group: Group }) {
  return (
    <div sx={styles.banner}>
      {group.banner === null || group.banner === "" ? (
        <div aria-hidden sx={styles.placeholder(toneFor(group.id))} />
      ) : (
        <img
          alt=""
          decoding="async"
          draggable={false}
          fetchPriority="high"
          src={group.banner}
          sx={styles.image}
        />
      )}
      <div aria-hidden sx={styles.shade} />
    </div>
  )
}
