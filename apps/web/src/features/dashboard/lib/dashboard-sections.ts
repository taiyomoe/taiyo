import type { Permissions } from "@taiyomoe/permissions"
import {
  Banner,
  CheckCircle,
  Clock,
  Comment,
  Dashboard,
  FileEdit,
  Flag,
  Grid,
  History,
  Image,
  Library,
  Mail,
  ListNumbered,
  NoteEdit,
  PenTool,
  Settings,
  Tag,
  Upload,
  User,
  UserCheck,
  Users,
} from "@taiyomoe/ui/components/icons"
import type { AppSidebarSection } from "@/components/shell/app-sidebar"
import {
  canOpenChapters,
  canOpenImages,
  canOpenMedias,
} from "@/features/catalog/lib/catalog-access"
import { m } from "@/paraglide/messages"

type DashboardItem = AppSidebarSection["items"][number] & {
  visible: (can: Permissions) => boolean
}

type DashboardSection = Omit<AppSidebarSection, "items"> & { items: DashboardItem[] }

const ANOTHER_USER = { id: "", role: "USER" } as const

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    items: [
      { label: m.dashboard_nav_overview, icon: Dashboard, to: "/dashboard", visible: () => true },
      {
        label: m.dashboard_nav_activity_log,
        icon: History,
        to: "/dashboard/activity-log",
        visible: (can) => can("auditLog.read"),
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
      {
        label: m.dashboard_nav_page_reports,
        icon: Flag,
        to: "/dashboard/page-reports",
        visible: (can) => can("pageReport.review"),
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
        label: m.dashboard_nav_all_groups,
        icon: Grid,
        to: "/dashboard/all-groups",
        visible: (can) => can("group.list"),
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
      {
        label: m.dashboard_nav_media,
        icon: Library,
        to: "/dashboard/medias",
        visible: canOpenMedias,
      },
      {
        label: m.dashboard_nav_chapters,
        icon: ListNumbered,
        to: "/dashboard/chapters",
        visible: canOpenChapters,
      },
      {
        label: m.dashboard_nav_covers,
        icon: Image,
        to: "/dashboard/covers",
        visible: canOpenImages,
      },
      {
        label: m.dashboard_nav_banners,
        icon: Banner,
        to: "/dashboard/banners",
        visible: canOpenImages,
      },
      { label: m.dashboard_nav_tags, icon: Tag, visible: (can) => can("media.update") },
    ],
  },
  {
    label: m.dashboard_nav_people,
    items: [
      {
        label: m.dashboard_nav_staff,
        icon: PenTool,
        to: "/dashboard/staffs",
        visible: (can) => can("staff.update"),
      },
    ],
  },
  {
    label: m.dashboard_nav_community,
    items: [
      {
        label: m.dashboard_nav_users,
        icon: User,
        to: "/dashboard/users",
        visible: (can) => can("user.list"),
      },
      {
        label: m.dashboard_nav_comments,
        icon: Comment,
        to: "/dashboard/comments",
        visible: (can) => can("comment.delete"),
      },
      {
        label: m.dashboard_nav_reports,
        icon: Flag,
        to: "/dashboard/comment-reports",
        visible: (can) => can("comment.review"),
      },
      {
        label: m.dashboard_nav_group_reports,
        icon: Flag,
        to: "/dashboard/group-reports",
        visible: (can) => can("groupReport.review"),
      },
    ],
  },
  {
    label: m.dashboard_nav_system,
    items: [
      {
        label: m.dashboard_nav_settings,
        icon: Settings,
        visible: (can) => can("user.setRole", ANOTHER_USER),
      },
    ],
  },
]
