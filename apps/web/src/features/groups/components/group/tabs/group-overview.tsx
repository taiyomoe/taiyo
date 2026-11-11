import "@stylexjs/stylex"
import type { Group } from "@/features/groups/api/groups"
import { GroupLinks } from "@/features/groups/components/group/group-links"
import { GroupAbout } from "@/features/groups/components/group/profile/group-about"
import { GroupDetails } from "@/features/groups/components/group/profile/group-details"
import { GroupActivityTiles } from "@/features/groups/components/group/profile/group-highlights"
import { GroupLeadersSection } from "@/features/groups/components/group/profile/group-leaders-section"
import { groupProfileStyles } from "@/features/groups/components/group/profile/group-profile-styles"
import { GroupRecentReleases } from "@/features/groups/components/group/profile/group-recent-releases"

export function GroupOverview({ group }: { group: Group }) {
  return (
    <div sx={groupProfileStyles.column}>
      <GroupActivityTiles group={group} />
      <div sx={groupProfileStyles.grid}>
        <div sx={groupProfileStyles.column}>
          <GroupRecentReleases groupId={group.id} />
          <GroupLeadersSection groupId={group.id} />
        </div>
        <div sx={groupProfileStyles.column}>
          <GroupAbout group={group} />
          <GroupLinks group={group} />
          <GroupDetails group={group} />
        </div>
      </div>
    </div>
  )
}
