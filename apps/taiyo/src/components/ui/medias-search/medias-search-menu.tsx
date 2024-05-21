import { Modal, ModalContent } from "@nextui-org/modal"
import { Command } from "cmdk"
import { useState } from "react"
import { MediasSearchButton } from "~/components/ui/medias-search/medias-search-button"
import { MediasSearchInput } from "~/components/ui/medias-search/medias-search-input"
import { MediasSearchResults } from "~/components/ui/medias-search/medias-search-results"
import { MediasSearchTypes } from "~/components/ui/medias-search/medias-search-types"

export const MediasSearchMenu = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <MediasSearchButton onClick={() => setOpen(true)} />
      <Modal
        backdrop="opaque"
        hideCloseButton
        isOpen={open}
        size="xl"
        classNames={{
          base: "border-default-100 border-small border-content2 supports-[background-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-md bg-content1/80",
          backdrop: "bg-black/80",
        }}
        onClose={() => setOpen(false)}
      >
        <ModalContent>
          <Command
            className="max-h-full overflow-y-auto"
            label="Quick search command"
          >
            <MediasSearchInput />
            <Command.List className="p-3">
              <div className="flex gap-4">
                <MediasSearchTypes />
                <Command.Separator className="w-px bg-content4" alwaysRender />
                <MediasSearchResults />
              </div>
            </Command.List>
          </Command>
        </ModalContent>
      </Modal>
    </>
  )
}
