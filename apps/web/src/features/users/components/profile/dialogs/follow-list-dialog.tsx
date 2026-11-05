import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { range } from "remeda"
import { UserName } from "@/components/user-name/user-name"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { followListQueryOptions } from "@/features/users/api/profile"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.25rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    padding: "0.5rem",
    borderRadius: radius.lg,
    gap: "0.75rem",
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: { default: "transparent", ":hover": colors.chipHover },
    color: "inherit",
    display: "flex",
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
    minWidth: 0,
  },
  names: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  username: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  skeletonName: {
    height: "0.875rem",
    width: "8rem",
  },
  avatarSkeleton: {
    borderRadius: radius.full,
    height: "2.25rem",
    width: "2.25rem",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "0.5rem",
  },
  empty: {
    margin: 0,
    paddingBlock: "1.5rem",
    color: colors.mutedForeground,
    textAlign: "center",
  },
})

export function FollowListDialog({
  userId,
  direction,
  onClose,
}: {
  userId: string
  direction: "followers" | "following" | null
  onClose: () => void
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={direction !== null}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>
            {direction === "following" ? m.profile_following_title() : m.profile_followers_title()}
          </DialogTitle>
        </DialogHeader>
        <DialogPanel>
          {direction === null ? null : (
            <FollowList direction={direction} onNavigate={onClose} userId={userId} />
          )}
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}

function FollowList({
  userId,
  direction,
  onNavigate,
}: {
  userId: string
  direction: "followers" | "following"
  onNavigate: () => void
}) {
  const query = useInfiniteQuery(followListQueryOptions(userId, direction))
  const users = query.data?.pages.flatMap((page) => page.data) ?? []

  if (query.isPending) {
    return (
      <ul aria-hidden sx={styles.list}>
        {range(0, 6).map((index) => (
          <li key={index} sx={styles.row}>
            <Skeleton sx={styles.avatarSkeleton} />
            <Skeleton sx={styles.skeletonName} />
          </li>
        ))}
      </ul>
    )
  }

  if (users.length === 0) {
    return <p sx={styles.empty}>{m.profile_follow_list_empty()}</p>
  }

  return (
    <>
      <ul sx={styles.list}>
        {users.map((user) => (
          <li key={user.id}>
            <Link
              onClick={onNavigate}
              params={{ username: user.username }}
              to="/users/$username"
              {...stylex.props(styles.row)}
            >
              <PersonAvatar person={user} />
              <span sx={styles.names}>
                <UserName effect={user.nameEffect} name={user.displayUsername} sx={styles.name} />
                <span sx={styles.username}>@{user.username}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {query.hasNextPage ? (
        <div sx={styles.footer}>
          <Button
            loading={query.isFetchingNextPage}
            onClick={() => {
              void query.fetchNextPage()
            }}
            size="sm"
            variant="ghost"
          >
            {m.profile_load_more()}
          </Button>
        </div>
      ) : null}
    </>
  )
}
