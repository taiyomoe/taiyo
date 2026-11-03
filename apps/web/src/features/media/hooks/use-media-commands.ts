import { Book, Info } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import type { PaletteCommand } from "@/features/command-palette/lib/palette-command"
import type { Media } from "@/features/media/api/medias"
import { useEntityActions } from "@/features/command-palette/hooks/use-entity-actions"
import { useRegisterCommands } from "@/features/command-palette/hooks/use-register-commands"
import { useRememberEntity } from "@/features/command-palette/hooks/use-remember-entity"
import { toTitleEntity } from "@/features/command-palette/lib/to-entities"
import { libraryEntryQueryOptions } from "@/features/media/api/library"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const TABS = [
  { tab: "chapters", label: m.media_tab_chapters, icon: Book },
  { tab: "info", label: m.media_tab_information, icon: Info },
] as const

export function useMediaCommands(media: Media, signedIn: boolean) {
  const entityActions = useEntityActions()
  const entry = useQuery({ ...libraryEntryQueryOptions(media.id), enabled: signedIn })
  const title = toTitleEntity({
    id: media.id,
    title: getMainTitle(media.titles) ?? "",
    synopsis: media.synopsis,
    coverUrl: media.covers.find((cover) => cover.isMainCover)?.url ?? null,
    type: media.type,
    startDate: media.startDate,
  })

  useRememberEntity(title)
  useRegisterCommands([
    ...entityActions(title, {
      context: true,
      libraryStatus: signedIn ? (entry.data?.status ?? null) : undefined,
    }),
    ...TABS.map(({ tab, label, icon }): PaletteCommand => ({
      id: `title.tab.${tab}`,
      label: m.palette_show_tab({ tab: label() }),
      section: "context",
      icon,
      keywords: ["tab", "section"],
      hint: title.title,
      run: {
        type: "navigate",
        to: { to: "/media/$mediaId", params: { mediaId: media.id }, search: { tab } },
      },
    })),
  ])
}
