import * as stylex from "@stylexjs/stylex"
import { Trash } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense, useState } from "react"
import { range } from "remeda"
import type { Session } from "@/lib/session"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { PagePagination } from "@/components/pagination/page-pagination"
import { TimeAgo } from "@/components/time/time-ago"
import {
  type Group,
  type GroupComment,
  groupCommentsQueryOptions,
} from "@/features/groups/api/groups"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { GROUP_COMMENTS_PER_PAGE } from "@/features/groups/lib/group-page"
import { useCurrentHref } from "@/hooks/use-current-href"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { usePermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const MAX_LENGTH = 2000
const routeApi = getRouteApi("/groups/$groupId")
const styles = stylex.create({
  composer: {
    gap: "0.875rem",
    alignItems: "flex-start",
    display: "flex",
  },
  composerBody: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  composerFooter: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "flex-end",
  },
  signIn: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: "0.75rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  comment: {
    gap: "0.875rem",
    paddingBlock: "1.125rem",
    display: "flex",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  body: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  header: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    minHeight: "1.75rem",
  },
  author: {
    color: colors.foreground,
    fontSize: "0.9375rem",
    fontWeight: 600,
  },
  content: {
    margin: 0,
    color: colors.foreground,
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  delete: {
    color: colors.mutedForeground,
    marginInlineStart: "auto",
  },
  skeleton: {
    borderRadius: radius.lg,
    height: "4.5rem",
  },
})

export function GroupComments({ group, user }: { group: Group; user: Session["user"] | null }) {
  return (
    <div sx={groupStyles.panel}>
      {user === null ? <SignInPrompt /> : <Composer group={group} user={user} />}
      <Suspense
        fallback={
          <div sx={groupStyles.panel}>
            {range(0, 3).map((index) => (
              <Skeleton key={index} sx={styles.skeleton} />
            ))}
          </div>
        }
      >
        <CommentList groupId={group.id} user={user} />
      </Suspense>
    </div>
  )
}

function SignInPrompt() {
  const href = useCurrentHref()

  return (
    <div sx={styles.signIn}>
      {m.group_comments_sign_in()}
      <Button render={<Link search={{ redirect: href }} to="/auth/sign-in" />} size="sm">
        {m.auth_sign_in()}
      </Button>
    </div>
  )
}

function Composer({ group, user }: { group: Group; user: Session["user"] }) {
  const [content, setContent] = useState("")
  const queryClient = useQueryClient()
  const navigate = routeApi.useNavigate()
  const post = useMutation({
    mutationFn: async (text: string) =>
      ensureSuccess(
        await api.groups[":id"].comments.$post({
          param: { id: group.id },
          json: { content: text },
        }),
      ),
    onSuccess: async () => {
      setContent("")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["groups", group.id, "comments"] }),
        queryClient.invalidateQueries({ queryKey: ["groups", group.id], exact: true }),
      ])
      await navigate({
        resetScroll: false,
        search: (previous) => ({ ...previous, page: undefined }),
      })
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        if (content.trim() !== "") {
          post.mutate(content.trim())
        }
      }}
      sx={styles.composer}
    >
      <PersonAvatar
        person={{
          id: user.id,
          displayUsername: user.displayUsername ?? user.name,
          image: user.image ?? null,
        }}
      />
      <div sx={styles.composerBody}>
        <ErrorAlert message={post.isError ? getErrorMessage(post.error) : null} />
        <Textarea
          aria-label={m.group_comments_placeholder({ name: group.name })}
          maxLength={MAX_LENGTH}
          onChange={(event) => {
            setContent(event.target.value)
          }}
          placeholder={m.group_comments_placeholder({ name: group.name })}
          rows={3}
          value={content}
        />
        <div sx={styles.composerFooter}>
          <Button disabled={content.trim() === ""} loading={post.isPending} type="submit">
            {m.group_comments_post()}
          </Button>
        </div>
      </div>
    </form>
  )
}

function CommentList({ groupId, user }: { groupId: string; user: Session["user"] | null }) {
  const search = routeApi.useSearch()
  const { page = 1 } = search
  const navigate = routeApi.useNavigate()
  const { data } = useSuspenseQuery(
    groupCommentsQueryOptions(groupId, page, GROUP_COMMENTS_PER_PAGE),
  )

  if (data.data.length === 0) {
    return <p sx={groupStyles.muted}>{m.group_comments_empty()}</p>
  }

  return (
    <div>
      <p sx={groupStyles.count}>
        {data.meta.total === 1
          ? m.group_comments_count_one()
          : m.group_comments_count({ count: data.meta.total })}
      </p>
      <ol sx={styles.list}>
        {data.data.map((comment) => (
          <CommentItem key={comment.id} comment={comment} groupId={groupId} user={user} />
        ))}
      </ol>
      <PagePagination
        onJump={(target) => {
          void navigate({
            search: (previous) => ({ ...previous, page: target === 1 ? undefined : target }),
          })
        }}
        page={page}
        pageCount={Math.ceil(data.meta.total / GROUP_COMMENTS_PER_PAGE)}
        renderLink={(target) => (
          <Link
            params={{ groupId }}
            search={{ ...search, page: target === 1 ? undefined : target }}
            to="/groups/$groupId"
          />
        )}
      />
    </div>
  )
}

function CommentItem({
  comment,
  groupId,
  user,
}: {
  comment: GroupComment
  groupId: string
  user: Session["user"] | null
}) {
  const can = usePermissions(user)
  const queryClient = useQueryClient()
  const remove = useMutation({
    mutationFn: async () =>
      ensureSuccess(
        await api.groups[":id"].comments[":commentId"].$delete({
          param: { id: groupId, commentId: comment.id },
        }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["groups", groupId, "comments"] }),
        queryClient.invalidateQueries({ queryKey: ["groups", groupId], exact: true }),
      ]),
  })
  const [confirming, setConfirming] = useState(false)
  const role = comment.author.groupRole

  return (
    <li sx={styles.comment}>
      <PersonAvatar person={comment.author} />
      <div sx={styles.body}>
        <div sx={styles.header}>
          <span sx={styles.author}>{comment.author.displayUsername}</span>
          {role === null ? null : (
            <Badge variant={role === "OWNER" ? "warning" : "secondary"}>
              {role === "OWNER" ? m.group_leader() : m.group_role_member()}
            </Badge>
          )}
          <TimeAgo date={comment.createdAt} />
          {user !== null && (user.id === comment.author.id || can("comment.delete")) ? (
            <Button
              aria-label={m.group_comments_delete()}
              onClick={() => {
                setConfirming(true)
              }}
              size="icon-sm"
              sx={styles.delete}
              title={m.group_comments_delete()}
              variant="ghost"
            >
              <Trash />
            </Button>
          ) : null}
        </div>
        <p sx={styles.content}>{comment.content}</p>
      </div>
      <ConfirmDialog
        confirmation={
          confirming
            ? {
                title: m.group_comments_delete_title(),
                description: m.group_comments_delete_description(),
                confirmLabel: m.group_comments_delete(),
                destructive: true,
                run: () => remove.mutateAsync(),
              }
            : null
        }
        error={remove.isError ? getErrorMessage(remove.error) : null}
        onClose={() => {
          setConfirming(false)
          remove.reset()
        }}
        pending={remove.isPending}
      />
    </li>
  )
}
