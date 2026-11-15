import { UserAdd, UserRemove } from "@taiyomoe/ui/components/icons"
import type { PaletteCommand, UserEntity } from "@/features/command-palette/lib/palette-command"
import type { Session } from "@/lib/session"
import { useEntityActions } from "@/features/command-palette/hooks/use-entity-actions"
import { useRegisterCommands } from "@/features/command-palette/hooks/use-register-commands"
import { useRememberEntity } from "@/features/command-palette/hooks/use-remember-entity"
import { type UserProfile, useSetFollowing } from "@/features/users/api/profile"
import { m } from "@/paraglide/messages"

export function useProfileCommands(profile: UserProfile, viewer: Session["user"] | null) {
  const entityActions = useEntityActions()
  const setFollowing = useSetFollowing(profile)
  const entity: UserEntity = {
    kind: "user",
    id: profile.id,
    username: profile.username,
    displayUsername: profile.displayUsername,
    image: profile.image,
    nameEffect: profile.nameEffect,
  }
  const following = profile.viewerFollows === true
  const follow: PaletteCommand[] =
    viewer === null || viewer.id === profile.id
      ? []
      : [
          {
            id: "user.follow",
            label: following
              ? m.palette_action_unfollow_named({ name: profile.displayUsername })
              : m.palette_action_follow_named({ name: profile.displayUsername }),
            section: "context",
            subject: profile.displayUsername,
            icon: following ? UserRemove : UserAdd,
            keywords: ["follow", "unfollow", "subscribe"],
            run: { type: "perform", perform: () => setFollowing.mutateAsync(!following) },
          },
        ]

  useRememberEntity(entity)
  useRegisterCommands([...follow, ...entityActions(entity, { context: true })])
}
