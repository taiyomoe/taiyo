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
  Mail,
  ListNumbered,
  Mask,
  PenTool,
  Settings,
  Shield,
  Tag,
  User,
  UserCheck,
  Users,
} from "@taiyomoe/ui/components/icons"
import type { AppSidebarSection } from "@/components/shell/app-sidebar"
import { m } from "@/paraglide/messages"

type DashboardItem = AppSidebarSection["items"][number] & {
  visible: (can: Permissions) => boolean
}

type DashboardSection = Omit<AppSidebarSection, "items"> & { items: DashboardItem[] }

const ANY_CHAPTER = { uploaderId: "", groupIds: [] }
const ANOTHER_USER = { id: "", role: "USER" } as const

export const DASHBOARD_SECTIONS: DashboardSection[] = [
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
    label: m.dashboard_nav_groups,
    items: [
      {
        label: m.dashboard_nav_my_groups,
        icon: Users,
        to: "/dashboard/groups",
        visible: () => true,
      },
      {
        label: m.dashboard_nav_invitations,
        icon: Mail,
        to: "/dashboard/invitations",
        visible: () => true,
      },
      {
        label: m.dashboard_nav_ownership_requests,
        icon: UserCheck,
        to: "/dashboard/group-requests",
        visible: (can) => can("ownershipRequest.review"),
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
