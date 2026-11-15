import {
  Bookmark,
  Check,
  Copy,
  Edit,
  ExternalLink,
  Link,
  Refresh,
  Settings,
  Upload,
  UserRemove,
  Users,
} from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type {
  GroupEntity,
  PaletteCommand,
  PaletteEntity,
  TitleEntity,
  UserEntity,
} from "@/features/command-palette/lib/palette-command"
import type { LibraryStatus } from "@/features/media/api/library"
import { entityRoute } from "@/features/command-palette/lib/entity-routes"
import { entityLabel } from "@/features/command-palette/lib/palette-command"
import { useSetLibraryStatus } from "@/features/media/api/library"
import { LIBRARY_STATUSES, LIBRARY_STATUS_LABELS } from "@/features/media/lib/media-labels"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { usePermissions } from "@/lib/permissions"
import { sessionQueryOptions } from "@/lib/session"
import { m } from "@/paraglide/messages"

type ActionOptions = {
  context?: boolean
  libraryStatus?: LibraryStatus | null | undefined
}

export function useEntityActions() {
  const router = useRouter()
  const { data: session } = useQuery({ ...sessionQueryOptions, staleTime: "static" })
  const user = session?.user ?? null
  const can = usePermissions(user)
  const setLibraryStatus = useSetLibraryStatus()
  const pathOf = (entity: PaletteEntity) => router.buildLocation(entityRoute(entity)).href
  const shared = (entity: PaletteEntity, name: string, context: boolean): PaletteCommand[] => [
    ...(context
      ? []
      : [
          {
            id: `${entity.kind}.new-tab`,
            label: m.palette_action_new_tab(),
            section: "context",
            icon: ExternalLink,
            keywords: ["open", "tab", "window"],
            run: { type: "external", href: pathOf(entity) },
          } satisfies PaletteCommand,
        ]),
    {
      id: `${entity.kind}.copy-link`,
      label: context ? m.palette_action_copy_link_named({ name }) : m.palette_action_copy_link(),
      section: "context",
      icon: Link,
      keywords: ["copy", "url", "share"],
      run: { type: "copy", text: () => new URL(pathOf(entity), window.location.origin).href },
    },
    {
      id: `${entity.kind}.copy-id`,
      label: m.palette_action_copy_id(),
      section: "context",
      icon: Copy,
      keywords: ["copy", "uuid", "identifier"],
      ...(context ? { hint: name } : {}),
      run: { type: "copy", text: () => entity.id },
    },
  ]
  const libraryCommands = (title: TitleEntity, status: LibraryStatus | null | undefined) =>
    LIBRARY_STATUSES.map((value): PaletteCommand => ({
      id: `title.library.${value}`,
      label: LIBRARY_STATUS_LABELS[value](),
      section: "context",
      icon: Bookmark,
      checked: status === value,
      run: {
        type: "perform",
        perform: () => setLibraryStatus.mutateAsync({ mediaId: title.id, status: value }),
      },
    })).concat(
      status === null || status === undefined
        ? []
        : [
            {
              id: "title.library.remove",
              label: m.media_library_remove(),
              section: "context",
              icon: UserRemove,
              run: {
                type: "perform",
                perform: () => setLibraryStatus.mutateAsync({ mediaId: title.id, status: null }),
              },
            },
          ],
    )
  const titleActions = (title: TitleEntity, { context = false, libraryStatus }: ActionOptions) => {
    const name = title.title
    const commands: PaletteCommand[] = []

    if (!context) {
      commands.push({
        id: "title.open",
        label: m.palette_action_open_title(),
        section: "context",
        icon: ExternalLink,
        run: { type: "navigate", to: entityRoute(title) },
      })
    }

    if (can("chapter.submit")) {
      commands.push({
        id: "title.upload",
        label: context
          ? m.palette_action_upload_for_named({ name })
          : m.palette_action_upload_for_title(),
        section: "context",
        icon: Upload,
        keywords: ["upload", "chapter", "submit", "publish", "new"],
        run: { type: "navigate", to: { to: "/dashboard/upload", search: { mediaId: title.id } } },
      })
    }

    if (user !== null && (can("media.update") || can("media.suggest"))) {
      const direct = can("media.update")
      const named = direct ? m.palette_action_edit_named : m.palette_action_suggest_named
      const generic = direct ? m.media_edit : m.media_suggest_edit

      commands.push({
        id: "title.edit",
        label: context ? named({ name }) : generic(),
        section: "context",
        icon: Edit,
        keywords: ["suggest", "edit", "change", "fix", "metadata"],
        run: {
          type: "navigate",
          to: { to: "/media/$mediaId/edit", params: { mediaId: title.id } },
        },
      })
    }

    if (user !== null) {
      const addLabel = context
        ? m.palette_action_library_add_named({ name })
        : m.media_library_add()

      commands.push({
        id: "title.library",
        label:
          libraryStatus === undefined || libraryStatus === null
            ? addLabel
            : m.palette_action_library_change(),
        section: "context",
        icon: libraryStatus === undefined || libraryStatus === null ? Bookmark : Check,
        keywords: ["library", "follow", "bookmark", "reading", "plan", "status", "save"],
        ...(libraryStatus === undefined || libraryStatus === null
          ? {}
          : { hint: LIBRARY_STATUS_LABELS[libraryStatus]() }),
        run: {
          type: "page",
          page: { title: name, commands: () => libraryCommands(title, libraryStatus) },
        },
      })
    }

    if (can("media.reindex")) {
      commands.push({
        id: "title.reindex",
        label: m.palette_action_reindex(),
        section: "context",
        icon: Refresh,
        keywords: ["search", "meilisearch", "refresh", "index"],
        ...(context ? { hint: name } : {}),
        run: {
          type: "perform",
          perform: async () => {
            await ensureSuccess(await api.medias[":id"].reindex.$post({ param: { id: title.id } }))
          },
        },
      })
    }

    return [...commands, ...shared(title, name, context)]
  }
  const groupActions = (group: GroupEntity, { context = false }: ActionOptions) => {
    const name = group.name
    const commands: PaletteCommand[] = []

    if (!context) {
      commands.push({
        id: "group.open",
        label: m.palette_action_open_group(),
        section: "context",
        icon: ExternalLink,
        run: { type: "navigate", to: entityRoute(group) },
      })
    }

    if (can("chapter.submit") && can("group.uploadChapters", { id: group.id })) {
      commands.push({
        id: "group.upload",
        label: context
          ? m.palette_action_upload_as_named({ name })
          : m.palette_action_upload_as_group(),
        section: "context",
        icon: Upload,
        keywords: ["upload", "chapter", "submit", "publish", "new"],
        run: { type: "navigate", to: { to: "/dashboard/upload", search: { groupId: group.id } } },
      })
    }

    if (can("group.manageMembers", { id: group.id }) || can("group.update", { id: group.id })) {
      commands.push({
        id: "group.manage",
        label: context ? m.palette_action_manage_named({ name }) : m.palette_action_manage_group(),
        section: "context",
        icon: Settings,
        keywords: ["manage", "settings", "members", "edit", "invite"],
        run: {
          type: "navigate",
          to: { to: "/dashboard/groups/$groupId", params: { groupId: group.id } },
        },
      })
    }

    return [...commands, ...shared(group, name, context)]
  }
  const userActions = (target: UserEntity, { context = false }: ActionOptions) => {
    const name = target.displayUsername
    const commands: PaletteCommand[] = []

    if (!context) {
      commands.push({
        id: "user.open",
        label: m.palette_action_open_profile(),
        section: "context",
        icon: ExternalLink,
        run: { type: "navigate", to: entityRoute(target) },
      })
    }

    if (can("user.list")) {
      commands.push({
        id: "user.manage",
        label: context ? m.palette_action_moderate_named({ name }) : m.palette_action_moderate(),
        section: "context",
        icon: Users,
        keywords: ["manage", "moderate", "ban", "role", "admin"],
        run: { type: "navigate", to: { to: "/dashboard/users", search: { q: target.username } } },
      })
    }

    return [...commands, ...shared(target, name, context)]
  }
  const actionsFor = (entity: PaletteEntity, options: ActionOptions) => {
    if (entity.kind === "title") {
      return titleActions(entity, options)
    }

    if (entity.kind === "group") {
      return groupActions(entity, options)
    }

    return userActions(entity, options)
  }

  return (entity: PaletteEntity, options: ActionOptions = {}) =>
    actionsFor(entity, options).map((command): PaletteCommand =>
      options.context === true ? { ...command, subject: entityLabel(entity) } : command,
    )
}
