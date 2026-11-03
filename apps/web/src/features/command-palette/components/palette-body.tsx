import type { RefObject } from "react"
import * as stylex from "@stylexjs/stylex"
import { ArrowLeft, Spinner } from "@taiyomoe/ui/components/icons"
import {
  Command,
  CommandCollection,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandList,
  CommandPanel,
  CommandSeparator,
} from "@taiyomoe/ui/components/ui/command"
import { breakpoints, colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Fragment, useEffect, useState, useSyncExternalStore } from "react"
import { quickSearchQueryOptions } from "@/features/command-palette/api/quick-search"
import { PaletteFooter } from "@/features/command-palette/components/palette-footer"
import { PaletteRow } from "@/features/command-palette/components/palette-row"
import { PalettePreview } from "@/features/command-palette/components/preview/palette-preview"
import { useDebouncedValue } from "@/features/command-palette/hooks/use-debounced-value"
import { useEntityActions } from "@/features/command-palette/hooks/use-entity-actions"
import { useGlobalCommands } from "@/features/command-palette/hooks/use-global-commands"
import { useRunPaletteCommand } from "@/features/command-palette/hooks/use-run-palette-command"
import { buildPaletteGroups } from "@/features/command-palette/lib/build-palette-groups"
import { entityRoute } from "@/features/command-palette/lib/entity-routes"
import {
  type PaletteGroup,
  type PaletteItem,
  type PalettePage,
  type PaletteRun,
  isPaletteItem,
} from "@/features/command-palette/lib/palette-command"
import { usePalette } from "@/features/command-palette/lib/palette-context"
import { rememberEntity, useRecentEntities } from "@/features/command-palette/lib/recent-entities"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const SEARCH_DEBOUNCE_MS = 120
const PREVIEW_DEBOUNCE_MS = 90
const FOOTER_LABELS: Record<PaletteRun["type"], () => string> = {
  navigate: m.palette_footer_open,
  external: m.palette_footer_open,
  copy: m.palette_footer_copy,
  page: m.palette_footer_show,
  perform: m.palette_footer_run,
}
const styles = stylex.create({
  inputBar: {
    alignItems: "center",
    display: "flex",
    paddingInlineEnd: { default: 0, [breakpoints.maxSm]: "0.5rem" },
  },
  inputField: {
    flex: "1",
    position: "relative",
    minWidth: 0,
  },
  cancel: {
    borderStyle: "none",
    paddingBlock: "0.5rem",
    paddingInline: "0.5rem",
    backgroundColor: "transparent",
    color: colors.mutedForeground,
    cursor: "pointer",
    display: { default: "none", [breakpoints.maxSm]: "inline-flex" },
    flexShrink: 0,
    fontSize: "0.9375rem",
    fontWeight: 500,
  },
  spinner: {
    color: colors.mutedForeground,
    pointerEvents: "none",
    position: "absolute",
    transform: "translateY(-50%)",
    height: "1rem",
    right: "1.5rem",
    top: "50%",
    width: "1rem",
  },
  crumb: {
    borderRadius: radius.md,
    borderStyle: "none",
    gap: "0.375rem",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    backgroundColor: {
      default: colors.chip,
      ":hover": colors.chipHover,
    },
    color: colors.foreground,
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "0.8125rem",
    fontWeight: 500,
    marginInlineEnd: "-0.625rem",
    marginInlineStart: "calc(0.625rem + 0.75rem)",
    maxWidth: "12rem",
  },
  inputAfterCrumb: {
    paddingLeft: 0,
  },
  crumbLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  crumbIcon: {
    flexShrink: 0,
  },
  panel: {
    flex: "1",
    display: "flex",
    minHeight: 0,
  },
  results: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    minWidth: 0,
  },
  empty: {
    color: colors.mutedForeground,
  },
})

export function PaletteBody({
  open,
  initialQuery,
  onClose,
  escapeRef,
}: {
  open: boolean
  initialQuery: string
  onClose: () => void
  escapeRef: RefObject<(() => boolean) | null>
}) {
  const { registry } = usePalette()
  const contextCommands = useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  )
  const globalCommands = useGlobalCommands()
  const entityActions = useEntityActions()
  const recents = useRecentEntities()
  const { contentRatings } = useSettings()
  const execute = useRunPaletteCommand(onClose)
  const [query, setQuery] = useState(initialQuery)
  const [stack, setStack] = useState<PalettePage[]>([])
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)

    if (open) {
      setQuery(initialQuery)
      setStack([])
    }
  }

  const [highlightedKey, setHighlightedKey] = useState<string | null>(null)
  const page = stack.at(-1) ?? null
  const term = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS)
  const search = useQuery({
    ...quickSearchQueryOptions(term, contentRatings),
    enabled: page === null && term !== "",
    placeholderData: keepPreviousData,
  })
  const groups = buildPaletteGroups({
    query,
    page,
    contextCommands,
    globalCommands,
    recents,
    results: page === null && query.trim() !== "" ? search.data : undefined,
  })
  const previewKey = useDebouncedValue(highlightedKey, PREVIEW_DEBOUNCE_MS)
  const highlighted = groups
    .flatMap((group) => group.items)
    .find((item) => item.key === highlightedKey)
  const searching =
    page === null && query.trim() !== "" && (search.isFetching || term !== query.trim())
  const push = (next: PalettePage) => {
    setStack((current) => [...current, next])
    setQuery("")
  }
  const pop = () => {
    setStack((current) => current.slice(0, -1))
    setQuery("")
  }

  useEffect(() => {
    escapeRef.current = () => {
      if (stack.length === 0) {
        return false
      }

      setStack((current) => current.slice(0, -1))
      setQuery("")

      return true
    }
  })

  const actionsPage = (item: PaletteItem): PalettePage | null => {
    if (item.kind === "entity") {
      return { title: item.label, commands: () => entityActions(item.entity) }
    }

    return item.command.run.type === "page" ? item.command.run.page : null
  }
  const openActions = (item: PaletteItem | undefined) => {
    const next = item === undefined ? null : actionsPage(item)

    if (next !== null) {
      push(next)
    }

    return next !== null
  }
  const activate = (item: PaletteItem, { newTab }: { newTab: boolean }) => {
    if (item.kind === "entity") {
      rememberEntity(item.entity)
      execute({ type: "navigate", to: entityRoute(item.entity) }, { newTab })

      return
    }

    const command = registry.find(item.command.id) ?? item.command

    if (command.run.type === "page") {
      push(command.run.page)
    } else {
      execute(command.run, { newTab })
    }
  }
  const primaryLabel = () => {
    if (highlighted === undefined) {
      return null
    }

    return highlighted.kind === "entity"
      ? m.palette_footer_open()
      : FOOTER_LABELS[highlighted.command.run.type]()
  }

  return (
    <Command
      filter={null}
      itemToStringValue={(item) => (isPaletteItem(item) ? item.label : "")}
      items={groups}
      onItemHighlighted={(item) => {
        setHighlightedKey(isPaletteItem(item) ? item.key : null)
      }}
      onValueChange={(value, details) => {
        if (details.reason !== "item-press") {
          setQuery(value)
        }
      }}
      value={query}
    >
      <div sx={styles.inputBar}>
        {page === null ? null : (
          <button onClick={pop} sx={styles.crumb} type="button">
            <ArrowLeft size={14} {...stylex.props(styles.crumbIcon)} />
            <span sx={styles.crumbLabel}>{page.title}</span>
          </button>
        )}
        <div sx={styles.inputField}>
          <CommandInput
            aria-label={m.palette_label()}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && query === "" && stack.length > 0) {
                event.preventDefault()
                pop()
              } else if (event.key === "Tab" && !event.shiftKey) {
                if (openActions(highlighted)) {
                  event.preventDefault()
                }
              } else if (
                event.key === "Enter" &&
                (event.metaKey || event.ctrlKey) &&
                highlighted !== undefined
              ) {
                event.preventDefault()
                event.preventBaseUIHandler()
                activate(highlighted, { newTab: true })
              }
            }}
            placeholder={page === null ? m.palette_placeholder() : m.palette_placeholder_page()}
            {...(page === null ? {} : { startAddon: null, sx: styles.inputAfterCrumb })}
          />
          {searching ? <Spinner {...stylex.props(styles.spinner)} /> : null}
        </div>
        <button onClick={onClose} sx={styles.cancel} type="button">
          {m.palette_cancel()}
        </button>
      </div>
      <CommandPanel sx={styles.panel}>
        <div sx={styles.results}>
          <CommandEmpty sx={styles.empty}>
            {searching ? m.palette_searching() : m.palette_empty({ query: query.trim() })}
          </CommandEmpty>
          <CommandList>
            {(group: PaletteGroup) => (
              <Fragment key={group.value}>
                <CommandGroup items={group.items}>
                  {group.label === "" ? null : <CommandGroupLabel>{group.label}</CommandGroupLabel>}
                  <CommandCollection>
                    {(item: PaletteItem) => (
                      <PaletteRow
                        item={item}
                        key={item.key}
                        onActivate={activate}
                        onOpenActions={(target) => {
                          openActions(target)
                        }}
                      />
                    )}
                  </CommandCollection>
                </CommandGroup>
                <CommandSeparator />
              </Fragment>
            )}
          </CommandList>
        </div>
        <PalettePreview
          item={groups.flatMap((group) => group.items).find((item) => item.key === previewKey)}
        />
      </CommandPanel>
      <PaletteFooter
        hasActions={highlighted !== undefined && actionsPage(highlighted) !== null}
        nested={page !== null}
        onOpenActions={() => {
          openActions(highlighted)
        }}
        primary={primaryLabel()}
      />
    </Command>
  )
}
