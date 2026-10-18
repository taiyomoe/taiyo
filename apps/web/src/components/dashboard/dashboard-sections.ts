import type { Permissions } from "@taiyomoe/permissions"
import {
  Banner,
  CloudUpload,
  Comment,
  Dashboard,
  Flag,
  History,
  Image,
  Library,
  ListNumbered,
  Mask,
  PenTool,
  Settings,
  Shield,
  Tag,
  User,
  Users,
} from "@taiyomoe/ui/components/icons"
import type { AppSidebarSection } from "@/components/shell/app-sidebar"
import { m } from "@/paraglide/messages"

type DashboardItem = AppSidebarSection["items"][number] & {
  visible: (can: Permissions) => boolean
}

type DashboardSection = Omit<AppSidebarSection, "items"> & { items: DashboardItem[] }

const ANY_CHAPTER = { uploaderId: "", groupIds: [] }
const ANY_GROUP = { id: "" }
const ANOTHER_USER = { id: "", role: "USER" } as const
const SECTIONS: DashboardSection[] = [
  {
    items: [
      { label: m.dashboard_nav_overview, icon: Dashboard, to: "/dashboard", visible: () => true },
      {
        label: m.dashboard_nav_activity_log,
        icon: History,
        visible: (can) => can("dashboard.viewStats"),
      },
    ],
  },
  {
    label: m.dashboard_nav_catalog,
    items: [
      { label: m.dashboard_nav_media, icon: Library, visible: (can) => can("media.update") },
      {
        label: m.dashboard_nav_chapters,
        icon: ListNumbered,
        visible: (can) => can("chapter.update", ANY_CHAPTER),
      },
      {
        label: m.dashboard_nav_bulk_upload,
        icon: CloudUpload,
        visible: (can) => can("chapter.publish"),
      },
      { label: m.dashboard_nav_covers, icon: Image, visible: (can) => can("media.update") },
      { label: m.dashboard_nav_banners, icon: Banner, visible: (can) => can("media.update") },
      { label: m.dashboard_nav_tags, icon: Tag, visible: (can) => can("media.update") },
    ],
  },
  {
    label: m.dashboard_nav_people,
    items: [
      { label: m.dashboard_nav_staff, icon: PenTool, visible: (can) => can("staff.update") },
      { label: m.dashboard_nav_characters, icon: Mask, visible: (can) => can("media.update") },
      {
        label: m.dashboard_nav_scan_groups,
        icon: Users,
        visible: (can) => can("group.update", ANY_GROUP),
      },
    ],
  },
  {
    label: m.dashboard_nav_community,
    items: [
      { label: m.dashboard_nav_users, icon: User, visible: (can) => can("user.list") },
      { label: m.dashboard_nav_comments, icon: Comment, visible: (can) => can("comment.delete") },
      { label: m.dashboard_nav_reports, icon: Flag, visible: (can) => can("comment.delete") },
    ],
  },
  {
    label: m.dashboard_nav_system,
    items: [
      {
        label: m.dashboard_nav_roles,
        icon: Shield,
        visible: (can) => can("user.setRole", ANOTHER_USER),
      },
      {
        label: m.dashboard_nav_settings,
        icon: Settings,
        visible: (can) => can("user.setRole", ANOTHER_USER),
      },
    ],
  },
]

export const getDashboardSections = (can: Permissions): AppSidebarSection[] =>
  SECTIONS.map(({ items, ...section }) => ({
    ...section,
    items: items.filter((item) => item.visible(can)),
  })).filter((section) => section.items.length > 0)
