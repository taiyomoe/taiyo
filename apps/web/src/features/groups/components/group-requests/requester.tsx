import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { OwnershipRequest } from "@/features/groups/api/groups"
import { PersonAvatar } from "@/features/groups/components/group-avatar"

const styles = stylex.create({
  sentence: {
    gap: "0.375rem",
    alignItems: "baseline",
    display: "flex",
    flexGrow: 1,
    flexWrap: "wrap",
    minWidth: 0,
  },
  strong: {
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  verb: {
    color: colors.mutedForeground,
  },
})

export function Requester({
  person,
  verb,
}: {
  person: OwnershipRequest["requester"]
  verb: string
}) {
  return (
    <>
      <PersonAvatar person={person} />
      <div sx={styles.sentence}>
        <span sx={styles.strong}>{person.displayUsername}</span>
        <span sx={styles.verb}>{verb}</span>
      </div>
    </>
  )
}
