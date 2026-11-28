import {
  BookOpenText,
  Comment,
  Flag,
  List,
  Medal,
  Package,
  ThumbsUp,
  Trophy,
  User,
  UserAdd,
} from "@taiyomoe/ui/components/icons"
import { m } from "@/paraglide/messages"

export type NotificationRowVariant = "popover" | "page"

export const KINDS = {
  CHAPTER_PUBLISHED: { icon: BookOpenText, label: m.notifications_label_chapter },
  COMMENT_REPLY: { icon: Comment, label: m.notifications_label_reply },
  COMMENT_LIKE: { icon: ThumbsUp, label: m.notifications_label_upvotes },
  FOLLOW: { icon: UserAdd, label: m.notifications_label_follow },
  RANKING_REWARD: { icon: Trophy, label: m.notifications_label_ranking },
  ACHIEVEMENT_EARNED: { icon: Medal, label: m.notifications_label_achievement },
  LIST_MODERATED: { icon: List, label: m.notifications_label_list },
  PROFILE_MODERATED: { icon: User, label: m.notifications_label_profile },
  REPORT_REVIEWED: { icon: Flag, label: m.notifications_label_report },
  DATA_EXPORT_READY: { icon: Package, label: m.notifications_label_data_export },
} as const
