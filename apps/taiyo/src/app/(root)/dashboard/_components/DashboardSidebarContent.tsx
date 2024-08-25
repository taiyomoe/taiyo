"use client"

import { Accordion, AccordionItem } from "@nextui-org/accordion"
import { tv } from "tailwind-variants"
import { DashboardSidebarCRUDButtons } from "./DashboardSidebarCRUDButtons"

type Props = {
  className?: string
}

const sidebarContent = tv({
  slots: {
    container: "flex max-w-[inherit] flex-col gap-4",
    categorytitle:
      "select-none font-semibold text-default-300 text-small uppercase",
    categoryIndicator: "text-default-300",
    categoryItemButton: "w-full justify-end gap-4 px-2 font-medium text-md",
  },
})

export const DashboardSidebarContent = ({ className }: Props) => {
  const { container, categorytitle, categoryIndicator } = sidebarContent()

  return (
    <Accordion
      defaultExpandedKeys={[
        "medias",
        "bulkMediaChapters",
        "mediaChapters",
        "scans",
      ]}
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
        title="— Capítulos (bulk)"
        key="bulkMediaChapters"
      >
        <DashboardSidebarCRUDButtons
          items={[
            {
              label: "Upar",
              href: "/dashboard/chapters/bulk-upload",
              type: "create",
            },
            {
              label: "Modificar",
              href: "/dashboard/chapters/bulk-edit",
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
              label: "Estatísticas",
              href: "/dashboard/chapters/stats",
              type: "stats",
            },
            {
              label: "Upar",
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
              label: "Lista",
              href: "/dashboard/scans",
              type: "home",
            },
            {
              label: "Adicionar",
              href: "/dashboard/scans/add",
              type: "create",
            },
            {
              label: "Modificar",
              href: "/dashboard/scans/edit",
              type: "update",
            },
          ]}
        />
      </AccordionItem>
    </Accordion>
  )
}
