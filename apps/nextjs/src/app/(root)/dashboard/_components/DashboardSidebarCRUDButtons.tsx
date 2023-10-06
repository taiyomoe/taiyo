import NextLink from "next/link";
import { Button } from "@nextui-org/button";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { tv } from "tailwind-variants";

type Props = {
  create: {
    label: string;
    href: string;
    isDisabled?: boolean;
  };
  update?: {
    label: string;
    href: string;
    isDisabled?: boolean;
  };
  del?: {
    label: string;
    href: string;
    isDisabled?: boolean;
  };
};

const sidebarCrudButton = tv({
  slots: {
    base: "text-md justify-end gap-4 px-2 font-medium w-full",
  },
});

export const DashboardSidebarCRUDButtons = ({ create, update, del }: Props) => {
  const { base } = sidebarCrudButton();

  return (
    <>
      <Button
        as={NextLink}
        endContent={<PlusIcon className="text-success" />}
        href={create.href}
        className={base()}
        variant="light"
        isDisabled={create.isDisabled}
      >
        {create.label}
      </Button>
      {update && (
        <Button
          as={NextLink}
          endContent={<PencilIcon className="text-warning" />}
          href={update.href}
          className={base()}
          variant="light"
          isDisabled={update.isDisabled}
        >
          {update.label}
        </Button>
      )}
      {del && (
        <Button
          as={NextLink}
          endContent={<Trash2Icon className="text-danger" />}
          href={del.href}
          className={base()}
          variant="light"
          isDisabled={del.isDisabled}
        >
          {del.label}
        </Button>
      )}
    </>
  );
};
