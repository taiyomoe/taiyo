import * as stylex from "@stylexjs/stylex"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { breakpoints, colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import { range } from "remeda"
import type { Session } from "@/lib/session"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { PagePagination } from "@/components/pagination/page-pagination"
import { TimeAgo } from "@/components/time/time-ago"
import { UserName } from "@/components/user-name/user-name"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import {
  PROFILE_COMMENTS_PER_PAGE,
  type ProfileComment,
  profileCommentsQueryOptions,
  type UserProfile,
  useCreateProfileComment,
  useDeleteProfileComment,
} from "@/features/users/api/profile"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { TitleBadge } from "@/features/users/components/profile/title-badge"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const MAX_LENGTH = 1000
const routeApi = getRouteApi("/users/$username")
const styles = stylex.create({
  root: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
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
  counter: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
  counterOver: {
    color: colors.destructiveForeground,
  },
  avatar: {
    height: { default: "2.25rem", [breakpoints.sm]: "2.75rem" },
    width: { default: "2.25rem", [breakpoints.sm]: "2.75rem" },
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  comment: {
    gap: "0.875rem",
    paddingBlock: "1rem",
    alignItems: "flex-start",
    display: "flex",
    borderTopColor: { default: colors.border, ":first-child": "transparent" },
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  commentBody: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  commentHead: {
    alignItems: "center",
    columnGap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "0.25rem",
    minWidth: 0,
  },
  authorLink: {
    borderRadius: radius.sm,
    overflow: "hidden",
    textDecoration: { default: "none", ":hover": "underline" },
    color: "inherit",
    fontWeight: 650,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  time: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  content: {
    margin: 0,
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  delete: {
    flexShrink: 0,
    opacity: { default: 0.4, ":focus-visible": 1, ":hover": 1 },
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
  },
  signIn: {
    margin: 0,
    color: colors.mutedForeground,
  },
  skeletonLine: {
    height: "0.875rem",
    width: "min(22rem, 80%)",
  },
  skeletonName: {
    height: "0.875rem",
    width: "8rem",
  },
  skeletonAvatar: {
    borderRadius: radius.full,
    flexShrink: 0,
    height: "2.75rem",
    width: "2.75rem",
  },
})

function Composer({ profile, viewer }: { profile: UserProfile; viewer: Session["user"] }) {
  const [content, setContent] = useState("")
  const create = useCreateProfileComment(profile)
  const length = content.trim().length
  const submit = () => {
    if (length === 0 || length > MAX_LENGTH) {
      return
    }

    create.mutate(content.trim(), {
      onSuccess: () => {
        setContent("")
      },
    })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      sx={[profileStyles.card, styles.composer]}
    >
      <PersonAvatar
        person={{
          id: viewer.id,
          displayUsername: viewer.displayUsername ?? viewer.name,
          image: viewer.image ?? null,
        }}
        sx={styles.avatar}
      />
      <div sx={styles.composerBody}>
        <ErrorAlert message={create.isError ? getErrorMessage(create.error) : null} />
        <Textarea
          aria-label={m.profile_comments_label()}
          maxLength={MAX_LENGTH + 200}
          onChange={(event) => {
            setContent(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder={m.profile_comments_placeholder({ name: profile.displayUsername })}
          rows={2}
          value={content}
        />
        <div sx={styles.composerFooter}>
          {length > MAX_LENGTH * 0.8 ? (
            <span sx={[styles.counter, length > MAX_LENGTH && styles.counterOver]}>
              {m.profile_comments_counter({ count: length, max: MAX_LENGTH })}
            </span>
          ) : null}
          <Button
            disabled={length === 0 || length > MAX_LENGTH}
            loading={create.isPending}
            size="sm"
            type="submit"
          >
            {m.profile_comments_post()}
          </Button>
        </div>
      </div>
    </form>
  )
}

function CommentItem({
  comment,
  onDelete,
}: {
  comment: ProfileComment
  onDelete: (comment: ProfileComment) => void
}) {
  return (
    <li sx={styles.comment}>
      <Link params={{ username: comment.author.username }} tabIndex={-1} to="/users/$username">
        <PersonAvatar person={comment.author} sx={styles.avatar} />
      </Link>
      <div sx={styles.commentBody}>
        <div sx={styles.commentHead}>
          <Link
            params={{ username: comment.author.username }}
            to="/users/$username"
            {...stylex.props(styles.authorLink)}
          >
            <UserName effect={comment.author.nameEffect} name={comment.author.displayUsername} />
          </Link>
          <TitleBadge size="sm" title={comment.author.title} />
          <TimeAgo date={comment.createdAt} sx={styles.time} />
        </div>
        <p sx={styles.content}>{comment.content}</p>
      </div>
      {comment.canDelete ? (
        <Button
          aria-label={m.profile_comments_delete()}
          onClick={() => {
            onDelete(comment)
          }}
          size="icon-sm"
          sx={styles.delete}
          title={m.profile_comments_delete()}
          variant="ghost"
        >
          <Close />
        </Button>
      ) : null}
    </li>
  )
}

export function CommentsTab({
  profile,
  viewer,
  page: requestedPage,
}: {
  profile: UserProfile
  viewer: Session["user"] | null
  page: number
}) {
  const page = useDeferredValue(requestedPage)
  const { data } = useSuspenseQuery(profileCommentsQueryOptions(profile.id, page))
  const navigate = routeApi.useNavigate()
  const remove = useDeleteProfileComment(profile)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const pageCount = Math.ceil(data.meta.total / PROFILE_COMMENTS_PER_PAGE)
  const toSearch = (target: number) => ({
    tab: "comments" as const,
    page: target === 1 ? undefined : target,
  })

  return (
    <div sx={styles.root}>
      {viewer === null ? (
        <p sx={styles.signIn}>
          <Link to="/auth/sign-in">{m.profile_comments_sign_in_link()}</Link>
          {" · "}
          {m.profile_comments_sign_in()}
        </p>
      ) : (
        <Composer profile={profile} viewer={viewer} />
      )}
      {data.data.length === 0 ? (
        <p sx={profileStyles.empty}>{m.profile_comments_empty()}</p>
      ) : (
        <ul sx={styles.list}>
          {data.data.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={(target) => {
                setConfirmation({
                  title: m.profile_comments_delete_title(),
                  description: m.profile_comments_delete_description(),
                  confirmLabel: m.profile_comments_delete(),
                  destructive: true,
                  run: () => remove.mutateAsync(target.id),
                })
              }}
            />
          ))}
        </ul>
      )}
      {pageCount > 1 ? (
        <PagePagination
          onJump={(target) => {
            void navigate({ search: toSearch(target), resetScroll: false })
          }}
          page={page}
          pageCount={pageCount}
          renderLink={(target) => (
            <Link
              params={{ username: profile.username }}
              resetScroll={false}
              search={toSearch(target)}
              to="/users/$username"
            />
          )}
        />
      ) : null}
      <ConfirmDialog
        confirmation={confirmation}
        error={remove.isError ? getErrorMessage(remove.error) : null}
        onClose={() => {
          setConfirmation(null)
          remove.reset()
        }}
        pending={remove.isPending}
      />
    </div>
  )
}

export function CommentsTabSkeleton() {
  return (
    <ul aria-hidden sx={styles.list}>
      {range(0, 4).map((index) => (
        <li key={index} sx={styles.comment}>
          <Skeleton sx={styles.skeletonAvatar} />
          <div sx={styles.commentBody}>
            <Skeleton sx={styles.skeletonName} />
            <Skeleton sx={styles.skeletonLine} />
          </div>
        </li>
      ))}
    </ul>
  )
}
