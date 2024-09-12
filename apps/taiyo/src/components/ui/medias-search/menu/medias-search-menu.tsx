import { Modal, ModalContent } from "@nextui-org/modal"
import { Command } from "cmdk"
import { InstantSearch } from "react-instantsearch"
import { useToggle } from "usehooks-ts"
import { MediasSearchResults } from "~/components/ui/medias-search/menu/medias-search-menu-results"
import { useDevice } from "~/hooks/useDevice"
import { meiliClient } from "~/meiliClient"
import { MediasSearchButton } from "./medias-search-menu-button"
import { MediasSearchInput } from "./medias-search-menu-input"
import { MediasSearchTypes } from "./medias-search-menu-types"

export const MediasSearchMenu = () => {
  const [isToggled, toggle] = useToggle(false)
  const { isAboveMobile } = useDevice()

  return (
    <>
      <MediasSearchButton onClick={toggle} />
      <Modal
        classNames={{
          base: "border-small border-content2 supports-[background-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-md bg-content1/80 h-[calc(100%-8px)] md:h-auto",
          wrapper: "max-h-dvh",
          backdrop: "bg-black/80",
        }}
        backdrop="opaque"
        isOpen={isToggled}
        onClose={toggle}
        placement={isAboveMobile ? "center" : "top"}
        size="3xl"
        hideCloseButton
      >
        <ModalContent>
          <InstantSearch searchClient={meiliClient} indexName="medias">
            <Command className="max-h-full" label="Quick search command">
              <MediasSearchInput toggleModal={toggle} />
              <div className="flex w-full flex-col gap-4 p-3 sm:flex-row">
                <MediasSearchTypes />
                <Command.Separator
                  className="h-px bg-content4 md:h-auto md:w-px"
                  alwaysRender
                />
                <MediasSearchResults toggleModal={toggle} />
              </div>
            </Command>
          </InstantSearch>
        </ModalContent>
      </Modal>
    </>
  )
}
