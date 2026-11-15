import type { GroupEntity } from "@/features/command-palette/lib/palette-command"
import type { Group } from "@/features/groups/api/groups"
import { useEntityActions } from "@/features/command-palette/hooks/use-entity-actions"
import { useRegisterCommands } from "@/features/command-palette/hooks/use-register-commands"
import { useRememberEntity } from "@/features/command-palette/hooks/use-remember-entity"

export function useGroupCommands(group: Group) {
  const entityActions = useEntityActions()
  const entity: GroupEntity = {
    kind: "group",
    id: group.id,
    name: group.name,
    description: group.description,
    logoUrl: group.logoUrl,
  }

  useRememberEntity(entity)
  useRegisterCommands(entityActions(entity, { context: true }))
}
