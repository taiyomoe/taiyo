"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { PanelBottomOpenIcon } from "lucide-react";

import { FloatingActionButton } from "~/components/generics/buttons/FloatingActionButton";

type Props = {
  content: JSX.Element;
};

export const Sidebar = ({ content }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div className="hidden h-full min-w-[200px] max-w-[200px] rounded-tr-lg bg-content1 sm:block">
        {content}
      </div>
      <Modal
        size="2xl"
        placement="bottom-center"
        onOpenChange={onOpenChange}
        isOpen={isOpen}
      >
        <ModalContent>
          <ModalHeader>Dashboard</ModalHeader>
          <ModalBody className="pb-6">{content}</ModalBody>
        </ModalContent>
      </Modal>
      <FloatingActionButton icon={<PanelBottomOpenIcon />} onPress={onOpen} />
    </>
  );
};
