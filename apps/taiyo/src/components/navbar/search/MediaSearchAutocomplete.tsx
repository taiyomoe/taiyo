"use client"

import type { AutocompleteProps } from "@nextui-org/autocomplete"
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete"
import { useAsyncList } from "@react-stately/data"
import { SearchIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback } from "react"
import { SearchedMediaCard } from "~/components/navbar/search/SearchedMediaCard"

import type { SearchedMedia } from "@taiyomoe/types"
import { api } from "~/lib/trpc/client"
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils"

type Props = {
  href?: (mediaId: string) => string
  onSelectionChange?: (media: SearchedMedia) => void
} & Omit<AutocompleteProps<SearchedMedia>, "onSelectionChange" | "children">

export const MediaSearchAutocomplete = (props: Props) => {
  const { href, onSelectionChange, ...rest } = props
  const { mutateAsync } = api.medias.search.useMutation()

  const list = useAsyncList<SearchedMedia>({
    load: async ({ filterText }) => {
      if (!filterText) return { items: [] }

      const data = await mutateAsync({ title: filterText })

      return {
        items: data,
      }
    },
  })

  const handleSelectionChange = useCallback(
    (key: string | number) => {
      if (onSelectionChange) {
        onSelectionChange(list.getItem(key))
      }
    },
    [onSelectionChange, list.getItem],
  )

  return (
    <Autocomplete<SearchedMedia>
      inputProps={{
        classNames: {
          base: "w-full",
          input: "text-base",
          inputWrapper: "h-[40px]",
        },
      }}
      listboxProps={{
        hideSelectedIcon: true,
        classNames: {
          list: "gap-2",
        },
      }}
      popoverProps={{
        placement: "bottom",
      }}
      inputValue={list.filterText}
      isLoading={list.isLoading}
      items={list.items}
      placeholder="Pesquisar..."
      onInputChange={list.setFilterText}
      onSelectionChange={handleSelectionChange}
      startContent={<SearchIcon className="text-default-500" />}
      aria-label="search media"
      radius="full"
      className="md:w-[350px] lg:w-[400px]"
      {...rest}
    >
      {(item) => (
        <AutocompleteItem
          key={item.id}
          as={href ? Link : undefined}
          href={href ? href(item.id) : undefined}
          classNames={{
            base: "p-0",
            title: "flex gap-2 h-[80px] text-ellipsis",
          }}
          textValue={item.title}
        >
          <SearchedMediaCard media={item} />
        </AutocompleteItem>
      )}
    </Autocomplete>
  )
}
