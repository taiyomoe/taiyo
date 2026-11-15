import * as stylex from "@stylexjs/stylex"
import { ThumbsUp } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link, useLocation } from "@tanstack/react-router"
import { type ListSummary, useVoteList } from "@/features/lists/api/lists"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  button: {
    position: "relative",
    zIndex: 1,
  },
  count: {
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
  },
  voted: {
    borderColor: `color-mix(in srgb, ${colors.primary} 40%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.primary} 12%, ${colors.card})`,
    color: `color-mix(in srgb, ${colors.primary} 80%, ${colors.foreground})`,
  },
})

export function ListVoteButton({
  list,
  viewerId,
  size = "sm",
}: {
  list: Pick<ListSummary, "id" | "upvoteCount" | "viewerVoted" | "owner">
  viewerId: string | null
  size?: "sm" | "default"
}) {
  const vote = useVoteList()
  const location = useLocation()
  const content = (
    <>
      <ThumbsUp />
      <span sx={styles.count}>{list.upvoteCount}</span>
    </>
  )

  if (viewerId === null) {
    return (
      <Button
        aria-label={m.lists_vote_sign_in()}
        render={<Link search={{ redirect: location.href }} to="/auth/sign-in" />}
        size={size}
        sx={styles.button}
        title={m.lists_vote_sign_in()}
        variant="outline"
      >
        {content}
      </Button>
    )
  }

  const isOwner = viewerId === list.owner.id
  let label = list.viewerVoted ? m.lists_unvote() : m.lists_vote()

  if (isOwner) {
    label = m.lists_vote_own()
  }

  return (
    <Button
      aria-label={label}
      aria-pressed={list.viewerVoted}
      disabled={isOwner}
      onClick={() => {
        vote.mutate(
          { id: list.id, voted: !list.viewerVoted },
          {
            onError: (error) => {
              toastManager.add({ title: getErrorMessage(error), type: "error" })
            },
          },
        )
      }}
      size={size}
      sx={[styles.button, list.viewerVoted ? styles.voted : null]}
      title={label}
      variant="outline"
    >
      {content}
    </Button>
  )
}
