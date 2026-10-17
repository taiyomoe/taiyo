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

export const DASHBOARD_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { label: m.dashboard_nav_overview, icon: Dashboard, to: "/dashboard" },
      { label: m.dashboard_nav_activity_log, icon: History },
    ],
  },
  {
    label: m.dashboard_nav_catalog,
    items: [
      { label: m.dashboard_nav_media, icon: Library },
      { label: m.dashboard_nav_chapters, icon: ListNumbered },
      { label: m.dashboard_nav_bulk_upload, icon: CloudUpload },
      { label: m.dashboard_nav_covers, icon: Image },
      { label: m.dashboard_nav_banners, icon: Banner },
      { label: m.dashboard_nav_tags, icon: Tag },
    ],
  },
  {
    label: m.dashboard_nav_people,
    items: [
      { label: m.dashboard_nav_staff, icon: PenTool },
      { label: m.dashboard_nav_characters, icon: Mask },
      { label: m.dashboard_nav_scan_groups, icon: Users },
    ],
  },
  {
    label: m.dashboard_nav_community,
    items: [
      { label: m.dashboard_nav_users, icon: User },
      { label: m.dashboard_nav_comments, icon: Comment },
      { label: m.dashboard_nav_reports, icon: Flag },
    ],
  },
  {
    label: m.dashboard_nav_system,
    items: [
      { label: m.dashboard_nav_roles, icon: Shield },
      { label: m.dashboard_nav_settings, icon: Settings },
    ],
  },
]
