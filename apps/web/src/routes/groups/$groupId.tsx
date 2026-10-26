import * as stylex from "@stylexjs/stylex"
import { Clock, Crown, ExternalLink, Settings } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { noop, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Suspense, useDeferredValue } from "react"
import { range } from "remeda"
import { z } from "zod"
import type { Group } from "@/features/groups/api/groups"
import type { Session } from "@/lib/session"
import { PagePagination } from "@/components/pagination/page-pagination"
import { sceneFont } from "@/components/scene/scene.stylex"
import { AppShell } from "@/components/shell/app-shell"
import { LatestList } from "@/features/chapters/components/latest-update-layouts"
import {
  groupChaptersQueryOptions,
  groupMembersQueryOptions,
  groupQueryOptions,
  myOwnershipRequestsQueryOptions,
} from "@/features/groups/api/groups"
import { ClaimGroupDialog } from "@/features/groups/components/claim-group-dialog"
import { GroupAvatar, PersonAvatar } from "@/features/groups/components/group-avatar"
import { usePermissions } from "@/lib/permissions"
import { getContentRatings, useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const GROUP_CHAPTERS_PER_PAGE = 20
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
const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/groups/$groupId")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, params: { groupId }, deps: { page } }) => {
    const group = context.queryClient.query(groupQueryOptions(groupId))
    const prefetch = Promise.all(
      [
        group,
        context.queryClient.query(groupMembersQueryOptions(groupId)),
        context.queryClient.query(
          groupChaptersQueryOptions(
            groupId,
            getContentRatings(context.session),
            page,
            GROUP_CHAPTERS_PER_PAGE,
          ),
        ),
      ].map((query) => query.catch(noop)),
    )

    if (import.meta.env.SSR) {
      await prefetch
    }

    return { name: await group.then((data) => data.name).catch(() => null) }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData?.name === null || loaderData?.name === undefined
            ? m.group_meta_title_fallback()
            : m.group_meta_title({ name: loaderData.name }),
      },
    ],
  }),
  component: function Group() {
    const { session } = Route.useRouteContext()
    const { groupId } = Route.useParams()
    const { page } = Route.useLoaderDeps()
    const user = session?.user ?? null
    const { data: group } = useSuspenseQuery(groupQueryOptions(groupId))
    const can = usePermissions(user)
    const canManage =
      can("group.manageMembers", { id: group.id }) || can("group.update", { id: group.id })
    const links = LINKS.flatMap(([key, label]) => {
      const value = group[key]

      if (value === null || value === "") {
        return []
      }

      const href =
        key === "discord" && !/^https?:\/\//.test(value)
          ? `https://discord.gg/${value.replace(/^\/?invite\//, "")}`
          : value

      return /^https?:\/\//.test(href) ? [{ key, label, href }] : []
    })

    return (
      <AppShell user={user}>
        <div sx={styles.page}>
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
          <section sx={styles.column}>
            <h2 sx={styles.sectionTitle}>{m.group_members()}</h2>
            <Suspense fallback={<Skeleton sx={styles.skeleton} />}>
              <GroupMembers groupId={groupId} />
            </Suspense>
          </section>
          <section sx={styles.column}>
            <h2 sx={styles.sectionTitle}>{m.group_chapters()}</h2>
            <Suspense
              fallback={
                <div sx={styles.column}>
                  {range(0, 5).map((index) => (
                    <Skeleton key={index} sx={styles.skeleton} />
                  ))}
                </div>
              }
            >
              <GroupChapters groupId={groupId} page={page} />
            </Suspense>
          </section>
        </div>
      </AppShell>
    )
  },
})

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
