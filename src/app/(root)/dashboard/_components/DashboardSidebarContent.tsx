"use client"

import { Accordion, AccordionItem } from "@nextui-org/accordion"
import { tv } from "tailwind-variants"

import { DashboardSidebarCRUDButtons } from "./DashboardSidebarCRUDButtons"

type Props = {
  className?: string
}

const sidebarContent = tv({
  slots: {
    container: "flex flex-col gap-4 max-w-[inherit]",
    categorytitle:
      "uppercase text-small text-default-300 font-semibold select-none",
    categoryIndicator: "text-default-300",
    categoryItemButton: "text-md justify-end gap-4 px-2 font-medium w-full",
  },
})

export const DashboardSidebarContent = ({ className }: Props) => {
  const { container, categorytitle, categoryIndicator } = sidebarContent()

  return (
    <Accordion
      defaultExpandedKeys={["medias", "mediaChapters", "scans"]}
      className={container({ className })}
      selectionMode="multiple"
      showDivider={false}
      variant="light"
      isCompact
    >
      {/* MEDIA */}
      <AccordionItem
        classNames={{
          title: categorytitle(),
          indicator: categoryIndicator(),
        }}
        title="— Obras"
        key="medias"
      >
        <DashboardSidebarCRUDButtons
          items={[
            {
              label: "Importar",
              href: "/dashboard/medias/import",
              type: "create",
            },
            {
              label: "Adicionar",
              href: "/dashboard/medias/add",
              type: "create",
              isDisabled: true,
            },
            {
              label: "Modificar",
              href: "/dashboard/medias/edit",
              type: "update",
            },
          ]}
        />
      </AccordionItem>

      {/* MEDIA CHAPTERS */}
      <AccordionItem
        classNames={{
          title: categorytitle(),
          indicator: categoryIndicator(),
        }}
        title="— Capítulos"
        key="mediaChapters"
      >
        <DashboardSidebarCRUDButtons
          items={[
            {
              label: "Upar em massa",
              href: "/dashboard/chapters/bulk-upload",
              type: "create",
            },
            {
              label: "Adicionar",
              href: "/dashboard/chapters/upload",
              type: "create",
            },
            {
              label: "Modificar",
              href: "/dashboard/chapters/edit",
              type: "update",
              isDisabled: true,
            },
          ]}
        />
      </AccordionItem>

      {/* SCANS */}
      <AccordionItem
        classNames={{
          title: categorytitle(),
          indicator: categoryIndicator(),
        }}
        title="— Scans"
        key="scans"
      >
        <DashboardSidebarCRUDButtons
          items={[
            {
              label: "Adicionar",
              href: "/dashboard/scans/add",
              type: "create",
            },
          ]}
        />
      </AccordionItem>
    </Accordion>
  )
}
