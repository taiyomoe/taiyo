import { Button } from "@nextui-org/button"
import {
  BarChart2Icon,
  ListChecksIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import NextLink from "next/link"

type Props = {
  items: {
    label: string
    href: string
    type: "create" | "update" | "del" | "stats" | "home"
    isDisabled?: boolean
  }[]
}

export const DashboardSidebarButtons = ({ items }: Props) =>
  items.map(({ label, href, type, isDisabled }) => (
    <Button
      key={href}
      as={NextLink}
      endContent={
        type === "create" ? (
          <PlusIcon className="text-success" />
        ) : type === "update" ? (
          <PencilIcon className="text-warning" />
        ) : type === "del" ? (
          <Trash2Icon className="text-danger" />
        ) : type === "stats" ? (
          <BarChart2Icon className="text-primary" />
        ) : (
          <ListChecksIcon />
        )
      }
      href={href}
      className="w-full justify-end gap-4 px-2 font-medium text-md"
      variant="light"
      isDisabled={isDisabled}
    >
      {label}
    </Button>
  ))
