import {
  Modal,
  ModalBody,
  ModalContent,
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
        onPress={onOpen}
        isIconOnly
      />
      <Modal
        className="border-0 bg-transparent"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        hideCloseButton
      >
        <ModalContent className="m-0 p-4 shadow-none">
          <ModalBody className="p-0">
            <MediaSearchAutocomplete />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
