import type { Permissions } from "@taiyomoe/permissions"
import {
  Banner,
  CheckCircle,
  Clock,
  CloudUpload,
  Comment,
  Dashboard,
  FileEdit,
  Flag,
  History,
  Image,
  Library,
  Mail,
  ListNumbered,
  Mask,
  NoteEdit,
  PenTool,
  Settings,
  Shield,
  Tag,
  Upload,
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

const ANY_CHAPTER = { uploaderId: "", status: "PUBLISHED", groupIds: [] } as const
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
    label: m.dashboard_nav_chapters_section,
    items: [
      {
        label: m.dashboard_nav_upload,
        icon: Upload,
        to: "/dashboard/upload",
        visible: (can) => can("chapter.submit"),
      },
      {
        label: m.dashboard_nav_submissions,
        icon: Clock,
        to: "/dashboard/submissions",
        visible: (can) => can("chapter.submit"),
      },
      {
        label: m.dashboard_nav_chapter_reviews,
        icon: CheckCircle,
        to: "/dashboard/chapter-reviews",
        visible: (can) => can("chapter.review"),
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
      {
        label: m.dashboard_nav_my_suggestions,
        icon: NoteEdit,
        to: "/dashboard/my-suggestions",
        visible: (can) => can("media.suggest"),
      },
      {
        label: m.dashboard_nav_review_suggestions,
        icon: FileEdit,
        to: "/dashboard/suggestions",
        visible: (can) => can("mediaSuggestion.review"),
      },
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
