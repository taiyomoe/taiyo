import { ListChecksIcon, PencilIcon, PlusIcon } from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/sidebar/sidebar"
import { CompanyLogo } from "~/components/ui/CompanyLogo"

const groups = [
  {
    name: "Obras",
    items: [
      {
        name: "Lista",
        url: "/dashboard/medias",
        type: "list",
      },
      {
        name: "Importar",
        url: "/dashboard/medias/import",
        type: "add",
      },
      {
        name: "Adicionar",
        url: "/dashboard/medias/add",
        type: "add",
      },
      {
        name: "Sincronizar",
        url: "/dashboard/medias/sync",
        type: "edit",
      },
      {
        name: "Editar",
        url: "/dashboard/medias/edit",
        type: "edit",
      },
    ],
  },
  {
    name: "Capítulos (bulk)",
    items: [
      {
        name: "Upar",
        url: "/dashboard/chapters/bulk-upload",
        type: "add",
      },
      {
        name: "Modificar",
        url: "/dashboard/chapters/bulk-edit",
        type: "edit",
      },
    ],
  },
  {
    name: "Capítulos",
    items: [
      {
        name: "Lista",
        url: "/dashboard/chapters",
        type: "list",
      },
      {
        name: "Upar",
        url: "/dashboard/chapters/upload",
        type: "add",
      },
      {
        name: "Modificar",
        url: "/dashboard/chapters/edit",
        type: "edit",
        disabled: true,
      },
    ],
  },
  {
    name: "Scans",
    items: [
      {
        name: "Lista",
        url: "/dashboard/scans",
        type: "list",
      },
      {
        name: "Adicionar",
        url: "/dashboard/scans/add",
        type: "add",
      },
      {
        name: "Editar",
        url: "/dashboard/scans/edit",
        type: "edit",
      },
    ],
  },
]

export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex select-none justify-center gap-3">
          <CompanyLogo company="taiyo" width={35} priority />
          <p className="font-semibold text-xl">Taiyō</p>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.name}>
            <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                        data-disabled={item.disabled}
                      >
                        {item.type === "list" && <ListChecksIcon />}
                        {item.type === "add" && (
                          <PlusIcon className="text-success" />
                        )}
                        {item.type === "edit" && (
                          <PencilIcon className="text-warning" />
                        )}
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
