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
import { cn } from "~/lib/utils/cn";

type Props = {
  title: string;
  content: JSX.Element;
  className?: string;
};

export const Sidebar = ({ title, content, className }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div
        className={cn(
          "hidden h-full min-w-[200px] max-w-[200px] rounded-tr-lg bg-content1 sm:block",
          className,
        )}
      >
        {content}
      </div>
      <Modal
        size="2xl"
        placement="bottom-center"
        onOpenChange={onOpenChange}
        isOpen={isOpen}
      >
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalBody className="pb-6">{content}</ModalBody>
        </ModalContent>
      </Modal>
      <FloatingActionButton icon={<PanelBottomOpenIcon />} onPress={onOpen} />
    </>
  );
};
