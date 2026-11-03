import type { QuickSearchResults } from "@/features/command-palette/api/quick-search"
import { rankCommands } from "@/features/command-palette/lib/match-command"
import {
  type PaletteCommand,
  type PaletteEntity,
  type PaletteGroup,
  type PalettePage,
  type PaletteSection,
  commandItem,
  entityItem,
} from "@/features/command-palette/lib/palette-command"
import {
  toGroupEntity,
  toTitleEntity,
  toUserEntity,
} from "@/features/command-palette/lib/to-entities"
import { m } from "@/paraglide/messages"

const MAX_SEARCH_COMMANDS = 8
const SECTIONS: ReadonlyArray<{ section: PaletteSection; label: () => string }> = [
  { section: "context", label: m.palette_section_suggestions },
  { section: "navigate", label: m.palette_section_navigation },
  { section: "create", label: m.palette_section_create },
  { section: "dashboard", label: m.dashboard_name },
  { section: "preferences", label: m.palette_section_preferences },
  { section: "account", label: m.palette_section_account },
  { section: "help", label: m.palette_section_help },
]
const commandGroup = (value: string, label: string, commands: readonly PaletteCommand[]) =>
  commands.length === 0 ? [] : [{ value, label, items: commands.map(commandItem) }]
const entityGroup = (value: string, label: string, entities: readonly PaletteEntity[]) =>
  entities.length === 0 ? [] : [{ value, label, items: entities.map(entityItem) }]

export const buildPaletteGroups = ({
  query,
  page,
  contextCommands,
  globalCommands,
  recents,
  results,
}: {
  query: string
  page: PalettePage | null
  contextCommands: readonly PaletteCommand[]
  globalCommands: readonly PaletteCommand[]
  recents: readonly PaletteEntity[]
  results: QuickSearchResults | undefined
}): PaletteGroup[] => {
  const term = query.trim()

  if (page !== null) {
    const commands = page.commands()

    return commandGroup(
      "page",
      "",
      term === "" ? commands : rankCommands(term, commands).map(({ command }) => command),
    )
  }

  if (term === "") {
    const [context, ...rest] = SECTIONS.map(({ section, label }) =>
      commandGroup(
        section,
        label(),
        [...contextCommands, ...globalCommands].filter((command) => command.section === section),
      ),
    )

    return [
      ...(context ?? []),
      ...entityGroup("recent", m.palette_section_recent(), recents),
      ...rest.flat(),
    ]
  }

  const context = rankCommands(term, contextCommands).filter((match) => !match.weak)
  const global = rankCommands(term, globalCommands).slice(0, MAX_SEARCH_COMMANDS)
  const strong = [...context, ...global].some((match) => match.strong)
  const commandGroups = [
    ...commandGroup(
      "context",
      m.palette_section_suggestions(),
      context.map(({ command }) => command),
    ),
    ...commandGroup(
      "commands",
      m.palette_section_commands(),
      global.map(({ command }) => command),
    ),
  ]
  const entityGroups = [
    ...entityGroup("titles", m.palette_section_titles(), results?.titles.map(toTitleEntity) ?? []),
    ...entityGroup("groups", m.palette_section_groups(), results?.groups.map(toGroupEntity) ?? []),
    ...entityGroup("users", m.palette_section_users(), results?.users.map(toUserEntity) ?? []),
  ]

  return strong ? [...commandGroups, ...entityGroups] : [...entityGroups, ...commandGroups]
}
