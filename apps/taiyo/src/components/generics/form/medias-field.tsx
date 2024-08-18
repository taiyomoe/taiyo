import type { AlgoliaSearchResponse } from "@meilisearch/instant-meilisearch"
import { useSession } from "@taiyomoe/auth/client"
import type { MediasIndexItem } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { parseAsString, useQueryState } from "nuqs"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"
import {
  MediasSearchAutocomplete,
  type MediasSearchAutocompleteProps,
} from "~/components/ui/medias-search/autocomplete/medias-search-autocomplete"
import { meiliClient } from "~/meiliClient"

type Props = { name: string } & MediasSearchAutocompleteProps

export const MediasField = ({ name, ...rest }: Props) => {
  const [mediaId] = useQueryState(name, parseAsString.withDefault(""))
  const { setValue } = useFormContext()
  const [media, setMedia] = useState<MediasIndexItem>()
  const { data: session } = useSession()
  const placeholderText = useMemo(() => {
    if (!media) return "Pesquisar..."

    return MediaUtils.getDisplayTitle(
      media.titles,
      session?.user.preferredTitles,
    )
  }, [media, session])

  const handleSelectionChange = useCallback(
    (item: { id: string }) => {
      setValue(name, item.id, { shouldValidate: true, shouldDirty: true })
    },
    [setValue, name],
  )

  const searchMedia = useCallback(
    async (mediaId: string) => {
      const searched = await meiliClient.search([
        { indexName: "medias", query: mediaId },
      ])
      const results =
        searched.results as AlgoliaSearchResponse<MediasIndexItem>[]
      const media = results.at(0)?.hits.at(0)

      if (!media) {
        return
      }

      handleSelectionChange({ id: mediaId })
      setMedia(media)
    },
    [handleSelectionChange],
  )

  useEffect(() => {
    if (mediaId && z.string().uuid().safeParse(mediaId).success) {
      searchMedia(mediaId)
    }
  }, [searchMedia, mediaId])

  return (
    <MediasSearchAutocomplete
      label="Obra"
      onSelectionChange={handleSelectionChange}
      value={mediaId}
      placeholder={placeholderText}
      isDisabled={!!media}
      {...rest}
    />
  )
}
