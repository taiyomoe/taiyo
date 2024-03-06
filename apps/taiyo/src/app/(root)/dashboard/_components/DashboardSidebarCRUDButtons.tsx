import { Button } from "@nextui-org/button"
import { BarChart2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import NextLink from "next/link"
import { tv } from "tailwind-variants"

type Props = {
  items: {
    label: string
    href: string
    type: "create" | "update" | "del" | "stats"
    isDisabled?: boolean
  }[]
}

const sidebarCrudButton = tv({
  slots: {
    base: "text-md justify-end gap-4 px-2 font-medium w-full",
  },
})

export const DashboardSidebarCRUDButtons = ({ items }: Props) => {
  const { base } = sidebarCrudButton()

  return (
    <>
      {items.map(({ label, href, type, isDisabled }) => (
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
            ) : (
              <BarChart2Icon className="text-primary" />
            )
          }
          href={href}
          className={base()}
          variant="light"
          isDisabled={isDisabled}
        >
          {label}
        </Button>
      ))}
    </>
  )
}
