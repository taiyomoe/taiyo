import * as stylex from "@stylexjs/stylex"
import { Clock, Crown, ExternalLink, Settings } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { Suspense, useDeferredValue } from "react"
import { range } from "remeda"
import type { Session } from "@/lib/queries/session"
import { ClaimGroupDialog } from "@/components/groups/claim-group-dialog"
import { GroupAvatar, PersonAvatar } from "@/components/groups/group-avatar"
import { LatestList } from "@/components/home/latest-update-layouts"
import { PagePagination } from "@/components/pagination/page-pagination"
import { sceneFont } from "@/components/scene/scene.stylex"
import { AppShell } from "@/components/shell/app-shell"
import { usePermissions } from "@/lib/permissions"
import {
  type Group,
  groupChaptersQueryOptions,
  groupMembersQueryOptions,
  groupQueryOptions,
  myOwnershipRequestsQueryOptions,
} from "@/lib/queries/groups"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const GROUP_CHAPTERS_PER_PAGE = 20

const DESKTOP = "@media (width >= 64rem)"
const LINKS = [
  ["website", m.group_link_website],
  ["discord", m.group_link_discord],
  ["x", m.group_link_x],
  ["facebook", m.group_link_facebook],
  ["instagram", m.group_link_instagram],
  ["telegram", m.group_link_telegram],
  ["youtube", m.group_link_youtube],
] as const
const styles = stylex.create({
  page: {
    gap: "2rem",
    marginInline: "auto",
    paddingBlock: "2.5rem",
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2rem" },
    display: "flex",
    flexDirection: "column",
    maxWidth: "88rem",
    width: "100%",
  },
  header: {
    gap: "1.5rem",
    alignItems: { [DESKTOP]: "center", default: "flex-start" },
    display: "flex",
    flexDirection: { [DESKTOP]: "row", default: "column" },
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
    fontSize: { default: "2rem", "@media (width >= 48rem)": "2.75rem" },
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
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "1rem",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
    maxWidth: "48rem",
  },
  links: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
  linkIcon: {
    color: colors.mutedForeground,
  },
  column: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  members: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
  },
  member: {
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.625rem",
    paddingBlock: "0.3125rem",
    alignItems: "center",
    backgroundColor: colors.card,
    display: "inline-flex",
    paddingInlineEnd: "1rem",
    paddingInlineStart: "0.3125rem",
  },
  memberName: {
    fontSize: "0.9375rem",
    fontWeight: 500,
  },
  crown: {
    color: colors.warning,
    height: "1rem",
    width: "1rem",
  },
  note: {
    margin: 0,
    padding: "1rem",
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
  skeleton: {
    borderRadius: radius.xl,
    height: "4.5rem",
  },
})
const discordHref = (value: string) =>
  /^https?:\/\//.test(value) ? value : `https://discord.gg/${value.replace(/^\/?invite\//, "")}`
const linkHref = (key: (typeof LINKS)[number][0], value: string | null) => {
  if (value === null || value === "") {
    return null
  }

  const href = key === "discord" ? discordHref(value) : value

  return /^https?:\/\//.test(href) ? href : null
}

type GroupPageProps = {
  groupId: string
  user: Session["user"] | null
  page: number
}

export function GroupPage({ groupId, user, page }: GroupPageProps) {
  const { data: group } = useSuspenseQuery(groupQueryOptions(groupId))

  return (
    <AppShell user={user}>
      <div sx={styles.page}>
        <GroupHeader group={group} user={user} />
        <section sx={styles.column}>
          <h2 sx={styles.sectionTitle}>{m.group_members()}</h2>
          <Suspense fallback={<Skeleton sx={styles.skeleton} />}>
            <GroupMembers groupId={groupId} />
          </Suspense>
        </section>
        <section sx={styles.column}>
          <h2 sx={styles.sectionTitle}>{m.group_chapters()}</h2>
          <Suspense fallback={<ChaptersSkeleton />}>
            <GroupChapters groupId={groupId} page={page} />
          </Suspense>
        </section>
      </div>
    </AppShell>
  )
}

function GroupHeader({ group, user }: { group: Group; user: Session["user"] | null }) {
  const can = usePermissions(user)
  const canManage =
    can("group.manageMembers", { id: group.id }) || can("group.update", { id: group.id })
  const links = LINKS.flatMap(([key, label]) => {
    const href = linkHref(key, group[key])

    return href === null ? [] : [{ key, label, href }]
  })

  return (
    <>
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
      {group.description === null || group.description === "" ? null : (
        <p sx={styles.description}>{group.description}</p>
      )}
      {links.length === 0 ? null : (
        <div sx={styles.links}>
          {links.map((link) => (
            <Button
              key={link.key}
              render={<a href={link.href} rel="noopener noreferrer nofollow" target="_blank" />}
              size="sm"
              variant="outline"
            >
              {link.label()}
              <ExternalLink {...stylex.props(styles.linkIcon)} />
            </Button>
          ))}
        </div>
      )}
    </>
  )
}

function ClaimAction({ group, user }: { group: Group; user: Session["user"] | null }) {
  const requests = useQuery({ ...myOwnershipRequestsQueryOptions, enabled: user !== null })
  const pending = requests.data?.some(
    (request) => request.groupId === group.id && request.status === "PENDING",
  )

  if (user === null) {
    return <Button render={<Link to="/auth/sign-in" />}>{m.group_claim_sign_in()}</Button>
  }

  if (pending === true) {
    return (
      <Button disabled variant="secondary">
        <Clock />
        {m.group_claim_pending()}
      </Button>
    )
  }

  return (
    <ClaimGroupDialog
      group={group}
      onClaimed={() => {
        void requests.refetch()
      }}
      trigger={<Button disabled={requests.isPending}>{m.group_claim()}</Button>}
    />
  )
}

function GroupMembers({ groupId }: { groupId: string }) {
  const { data: members } = useSuspenseQuery(groupMembersQueryOptions(groupId))

  if (members.length === 0) {
    return <p sx={styles.note}>{m.group_members_empty()}</p>
  }

  return (
    <ul sx={styles.members}>
      {members.map((member) => (
        <li key={member.userId} sx={styles.member}>
          <PersonAvatar
            person={{
              id: member.userId,
              displayUsername: member.displayUsername,
              image: member.image,
            }}
          />
          <span sx={styles.memberName}>{member.displayUsername}</span>
          {member.role === "OWNER" ? (
            <Crown aria-label={m.group_role_owner()} {...stylex.props(styles.crown)} />
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function GroupChapters({ groupId, page }: { groupId: string; page: number }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const navigate = useNavigate({ from: "/groups/$groupId" })
  const { data } = useSuspenseQuery(
    groupChaptersQueryOptions(groupId, contentRatings, page, GROUP_CHAPTERS_PER_PAGE),
  )

  if (data.data.length === 0) {
    return <p sx={styles.note}>{m.group_chapters_empty()}</p>
  }

  return (
    <>
      <LatestList chapters={data.data} />
      <PagePagination
        onJump={(target) => {
          void navigate({ search: { page: target === 1 ? undefined : target } })
        }}
        page={page}
        pageCount={Math.ceil(data.meta.total / GROUP_CHAPTERS_PER_PAGE)}
        renderLink={(target) => (
          <Link
            params={{ groupId }}
            search={{ page: target === 1 ? undefined : target }}
            to="/groups/$groupId"
          />
        )}
      />
    </>
  )
}

function ChaptersSkeleton() {
  return (
    <div sx={styles.column}>
      {range(0, 5).map((index) => (
        <Skeleton key={index} sx={styles.skeleton} />
      ))}
    </div>
  )
}
