import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/react";
import { SearchIcon } from "lucide-react";

import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete";

export const MediaSearchModal = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        className="bg-transparent"
        startContent={<SearchIcon />}
        onClick={onOpen}
        isIconOnly
      />
      <Modal
        className="border-0 bg-transparent"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top"
        hideCloseButton
      >
        <ModalContent className="m-4 p-4 shadow-none">
          <ModalHeader className="drop-shadow-accent justify-center px-0 text-center text-4xl font-bold">
            Pesquisar
          </ModalHeader>
          <ModalBody className="p-0">
            <MediaSearchAutocomplete
              itemsHrefPrefix="/media"
              className="w-full"
              allowsCustomValue
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
