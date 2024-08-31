"use client"

import type { MediasIndexItem } from "@taiyomoe/types"
import { useRouter } from "next/navigation"
import {
  MediasAutocomplete,
  type MediasAutocompleteProps,
} from "~/components/ui/autocompletes/medias/medias-autocomplete"

type Props = { href: string } & MediasAutocompleteProps

export const MediasLinkAutocomplete = ({ href }: Props) => {
  const router = useRouter()

  const handleSelectionChange = (item: MediasIndexItem | null) => {
    if (!item) return

    router.push(href + item.id)
  }

  return <MediasAutocomplete onSelectionChange={handleSelectionChange} />
}
