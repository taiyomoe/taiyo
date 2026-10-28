import * as stylex from "@stylexjs/stylex"
import { Settings } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { Group } from "@/features/groups/api/groups"
import type { Session } from "@/lib/session"
import { sceneFont } from "@/components/scene/scene.stylex"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { ClaimAction } from "@/features/groups/components/group/claim-action"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  header: {
    gap: "1.5rem",
    alignItems: { [breakpoints.lg]: "center", default: "flex-start" },
    display: "flex",
    flexDirection: { [breakpoints.lg]: "row", default: "column" },
  },
  identity: {
    gap: "1.25rem",
    alignItems: "center",
    display: "flex",
    flexGrow: 1,
    minWidth: 0,
  },
  titles: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  name: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "2rem", [breakpoints.md]: "2.75rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    overflowWrap: "anywhere",
  },
  badges: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexShrink: 0,
    flexWrap: "wrap",
  },
})

export function GroupHeader({
  group,
  user,
  canManage,
}: {
  group: Group
  user: Session["user"] | null
  canManage: boolean
}) {
  return (
    <div sx={styles.header}>
      <div sx={styles.identity}>
        <GroupAvatar id={group.id} name={group.name} size="lg" />
        <div sx={styles.titles}>
          <h1 sx={styles.name}>{group.name}</h1>
          <div sx={styles.badges}>
            {group.owned ? (
              <Badge variant="success">{m.group_owned()}</Badge>
            ) : (
              <Badge variant="outline">{m.groups_unclaimed()}</Badge>
            )}
          </div>
        </div>
      </div>
      <div sx={styles.actions}>
        {canManage ? (
          <Button
            render={<Link params={{ groupId: group.id }} to="/dashboard/groups/$groupId" />}
            variant="outline"
          >
            <Settings />
            {m.group_manage()}
          </Button>
        ) : null}
        {group.owned ? null : <ClaimAction group={group} user={user} />}
      </div>
    </div>
  )
}
