"use client";

import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { tv } from "tailwind-variants";

import { DashboardSidebarCRUDButtons } from "./DashboardSidebarCRUDButtons";

const sidebarContent = tv({
  slots: {
    container: "flex flex-col gap-4",
    categorytitle:
      "uppercase text-small text-default-300 font-semibold select-none",
    categoryIndicator: "text-default-300",
    categoryContent: "ml-4 mr-2",
    categoryItemButton: "text-md justify-end gap-4 px-2 font-medium w-full",
  },
});

export const DashboardSidebarContent = () => {
  const { container, categorytitle, categoryIndicator, categoryContent } =
    sidebarContent();

  return (
    <Accordion
      defaultExpandedKeys={["medias", "mediaChapters", "tags"]}
      className={container()}
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
          content: categoryContent(),
        }}
        title="— Obras"
        key="medias"
      >
        <DashboardSidebarCRUDButtons
          create={{
            label: "Adicionar",
            href: "/dashboard/medias/add",
          }}
        />
      </AccordionItem>

      {/* MEDIA CHAPTERS */}
      <AccordionItem
        classNames={{
          title: categorytitle(),
          indicator: categoryIndicator(),
          content: categoryContent(),
        }}
        title="— Capítulos"
        key="mediaChapters"
      >
        <DashboardSidebarCRUDButtons
          create={{
            label: "Upar",
            href: "/dashboard/chapters/upload",
          }}
          update={{
            label: "Editar",
            href: "/dashboard/chapters/edit",
            isDisabled: true,
          }}
          del={{
            label: "Deletar",
            href: "/dashboard/chapters/delete",
            isDisabled: true,
          }}
        />
      </AccordionItem>

      {/* TAGS */}
      <AccordionItem
        classNames={{
          title: categorytitle(),
          indicator: categoryIndicator(),
          content: categoryContent(),
        }}
        title="— Tags"
        key="tags"
      >
        <DashboardSidebarCRUDButtons
          create={{
            label: "Adicionar",
            href: "/dashboard/tags/add",
          }}
          update={{
            label: "Editar",
            href: "/dashboard/tags/edit",
            isDisabled: true,
          }}
          del={{
            label: "Deletar",
            href: "/dashboard/tags/delete",
            isDisabled: true,
          }}
        />
      </AccordionItem>
    </Accordion>
  );
};
