import { Modal, ModalContent } from "@nextui-org/modal"
import type { MediasIndexItem } from "@taiyomoe/types"
import { Command } from "cmdk"
import type { SearchResponse } from "instantsearch.js"
import { debounce } from "radash"
import { useState } from "react"
import { useToggle } from "usehooks-ts"
import { MediasSearchButton } from "~/components/ui/medias-search/medias-search-button"
import { MediasSearchInput } from "~/components/ui/medias-search/medias-search-input"
import { MediasSearchResults } from "~/components/ui/medias-search/medias-search-results"
import { MediasSearchTypes } from "~/components/ui/medias-search/medias-search-types"
import { meiliClient } from "~/meiliClient"

export const MediasSearchMenu = () => {
  const [isToggled, toggle] = useToggle(false)
  const [results, setResults] = useState<MediasIndexItem[]>([])

  const handleSearch = debounce({ delay: 250 }, async (value: string) => {
    const query = await meiliClient.client.search([
      { query: value, indexName: "medias" },
    ])
    const hits = query.results
      .flatMap((r) => r as SearchResponse<MediasIndexItem>)
      .flatMap((r) => r.hits)

    setResults(hits)
  })

  return (
    <>
      <MediasSearchButton onClick={toggle} />
      <Modal
        backdrop="opaque"
        hideCloseButton
        isOpen={isToggled}
        size="xl"
        classNames={{
          base: "border-default-100 border-small border-content2 supports-[background-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-md bg-content1/80",
          backdrop: "bg-black/80",
        }}
        onClose={toggle}
        placement="top-center"
      >
        <ModalContent>
          <Command
            className="max-h-full overflow-y-auto"
            label="Quick search command"
          >
            <MediasSearchInput onChange={handleSearch} />
            <div className="flex w-full flex-col gap-4 p-3 sm:flex-row">
              <MediasSearchTypes />
              <Command.Separator className="w-px bg-content4" alwaysRender />
              <MediasSearchResults items={results} />
            </div>
          </Command>
        </ModalContent>
      </Modal>
    </>
  )
}
