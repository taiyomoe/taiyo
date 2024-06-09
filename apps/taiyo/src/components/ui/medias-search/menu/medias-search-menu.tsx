import { Modal, ModalContent } from "@nextui-org/modal"
import { Command } from "cmdk"
import { InstantSearch } from "react-instantsearch"
import { useToggle } from "usehooks-ts"
import { MediasSearchResults } from "~/components/ui/medias-search/menu/medias-search-menu-results"
import { meiliClient } from "~/meiliClient"
import { MediasSearchButton } from "./medias-search-menu-button"
import { MediasSearchInput } from "./medias-search-menu-input"
import { MediasSearchTypes } from "./medias-search-menu-types"

export const MediasSearchMenu = () => {
  const [isToggled, toggle] = useToggle(false)

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
          <InstantSearch searchClient={meiliClient} indexName="medias">
            <Command
              className="max-h-full overflow-y-auto"
              label="Quick search command"
            >
              <MediasSearchInput />
              <div className="flex w-full flex-col gap-4 p-3 sm:flex-row">
                <MediasSearchTypes />
                <Command.Separator className="w-px bg-content4" alwaysRender />
                <MediasSearchResults toggleModal={toggle} />
              </div>
            </Command>
          </InstantSearch>
        </ModalContent>
      </Modal>
    </>
  )
}
