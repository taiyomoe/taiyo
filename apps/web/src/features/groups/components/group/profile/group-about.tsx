import "@stylexjs/stylex"
import type { Group } from "@/features/groups/api/groups"
import { RichText } from "@/components/rich-text/rich-text"
import { parseRichText } from "@/components/rich-text/rich-text-document"
import { groupProfileStyles } from "@/features/groups/components/group/profile/group-profile-styles"
import { m } from "@/paraglide/messages"

export function GroupAbout({ group }: { group: Group }) {
  const description = parseRichText(group.description ?? "")

  return (
    <section sx={groupProfileStyles.section}>
      <h2 sx={groupProfileStyles.sectionTitle}>{m.group_about()}</h2>
      {description.children.length === 0 ? (
        <p sx={groupProfileStyles.empty}>{m.group_no_description()}</p>
      ) : (
        <RichText collapsible document={description} />
      )}
    </section>
  )
}
