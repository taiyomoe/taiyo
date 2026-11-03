import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import type { GroupEntity } from "@/features/command-palette/lib/palette-command"
import { previewStyles } from "@/features/command-palette/components/preview/preview-styles"
import { groupMembersQueryOptions, groupQueryOptions } from "@/features/groups/api/groups"
import { GroupAvatar, PersonAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const MAX_MEMBERS = 6
const styles = stylex.create({
  logo: {
    borderRadius: radius.lg,
    flexShrink: 0,
    fontSize: "1.25rem",
    height: "4rem",
    width: "4rem",
  },
  members: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  member: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.8125rem",
    minWidth: 0,
  },
  memberAvatar: {
    height: "1.5rem",
    width: "1.5rem",
  },
  memberFallback: {
    fontSize: "0.6875rem",
  },
  memberName: {
    flex: "1",
    overflow: "hidden",
    color: colors.foreground,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function GroupPreview({ group }: { group: GroupEntity }) {
  const { data: detail } = useQuery({ ...groupQueryOptions(group.id), staleTime: 60_000 })
  const { data: members } = useQuery({
    ...groupMembersQueryOptions(group.id),
    staleTime: 60_000,
  })
  const description = detail?.description ?? group.description
  const created =
    detail === undefined
      ? null
      : new Intl.DateTimeFormat(getLocale(), { month: "long", year: "numeric" }).format(
          new Date(detail.createdAt),
        )

  return (
    <div sx={previewStyles.root}>
      <div sx={previewStyles.header}>
        <GroupAvatar
          id={group.id}
          logoUrl={detail?.logoUrl ?? group.logoUrl}
          name={group.name}
          size="lg"
          sx={styles.logo}
        />
        <div sx={previewStyles.headerText}>
          <span sx={previewStyles.heading}>{group.name}</span>
          {members === undefined ? null : (
            <span sx={previewStyles.subtle}>
              {members.length === 1
                ? m.palette_preview_member()
                : m.palette_preview_members({ count: members.length })}
            </span>
          )}
          {created === null ? null : (
            <span sx={previewStyles.subtle}>{m.palette_preview_since({ date: created })}</span>
          )}
        </div>
      </div>
      <p sx={description === null ? previewStyles.subtle : previewStyles.body}>
        {description ?? m.palette_group_no_description()}
      </p>
      <div sx={previewStyles.section}>
        <span sx={previewStyles.label}>{m.group_members()}</span>
        {members === undefined ? (
          <>
            <Skeleton sx={previewStyles.line} />
            <Skeleton sx={[previewStyles.line, previewStyles.lineShort]} />
          </>
        ) : (
          <div sx={styles.members}>
            {members.length === 0 ? (
              <span sx={previewStyles.subtle}>{m.group_members_empty()}</span>
            ) : null}
            {members.slice(0, MAX_MEMBERS).map((member) => (
              <div key={member.userId} sx={styles.member}>
                <PersonAvatar
                  fallbackSx={styles.memberFallback}
                  person={{ ...member, id: member.userId }}
                  sx={styles.memberAvatar}
                />
                <span sx={styles.memberName}>{member.displayUsername}</span>
                {member.role === "OWNER" ? (
                  <span sx={previewStyles.subtle}>{m.group_role_owner()}</span>
                ) : null}
              </div>
            ))}
            {members.length > MAX_MEMBERS ? (
              <span sx={previewStyles.subtle}>
                {m.palette_preview_more({ count: members.length - MAX_MEMBERS })}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
