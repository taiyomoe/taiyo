import * as stylex from "@stylexjs/stylex"
import { Bookmark, Check } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  type Group,
  groupFollowQueryOptions,
  groupQueryOptions,
} from "@/features/groups/api/groups"
import { useCurrentHref } from "@/hooks/use-current-href"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  button: {
    width: "100%",
  },
  skeleton: {
    borderRadius: radius.full,
    height: "2.75rem",
  },
})

export function FollowGroupButton({ group, signedIn }: { group: Group; signedIn: boolean }) {
  const href = useCurrentHref()

  if (!signedIn) {
    return (
      <Button
        render={<Link search={{ redirect: href }} to="/auth/sign-in" />}
        size="lg"
        sx={styles.button}
      >
        <Bookmark />
        {m.group_follow()}
      </Button>
    )
  }

  return <SignedInFollowButton groupId={group.id} />
}

function SignedInFollowButton({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient()
  const follow = useQuery(groupFollowQueryOptions(groupId))
  const toggle = useMutation({
    mutationFn: async (next: boolean) => {
      const param = { param: { id: groupId } }

      return unwrap(
        next
          ? await api.groups[":id"].follow.$post(param)
          : await api.groups[":id"].follow.$delete(param),
      )
    },
    onSuccess: (state) => {
      queryClient.setQueryData(groupFollowQueryOptions(groupId).queryKey, state)
      queryClient.setQueryData(groupQueryOptions(groupId).queryKey, (group) =>
        group === undefined ? group : { ...group, followerCount: state.followerCount },
      )
    },
  })

  if (follow.data === undefined) {
    return <Skeleton sx={styles.skeleton} />
  }

  const following = toggle.isPending ? toggle.variables : follow.data.following

  return (
    <Button
      aria-pressed={following}
      onClick={() => {
        toggle.mutate(!following)
      }}
      size="lg"
      sx={styles.button}
      variant={following ? "secondary" : "default"}
    >
      {following ? <Check /> : <Bookmark />}
      {following ? m.group_following() : m.group_follow()}
    </Button>
  )
}
