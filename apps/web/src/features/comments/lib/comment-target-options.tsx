import { COMMENT_TARGET_TYPES, type CommentTargetType } from "@taiyomoe/db/constants"
import { Comment, Library, ListNumbered, User, Users } from "@taiyomoe/ui/components/icons"
import type { OptionSet } from "@/components/fields/option-select"
import { COMMENT_TARGET_LABELS } from "@/features/comment-reports/components/comment-report-target"

const ICONS = {
  MEDIA: Library,
  CHAPTER: ListNumbered,
  GROUP: Users,
  USER: User,
} satisfies Record<CommentTargetType, unknown>

export const COMMENT_TARGET_OPTIONS: OptionSet<CommentTargetType> = {
  values: COMMENT_TARGET_TYPES,
  label: (type) => COMMENT_TARGET_LABELS[type](),
  icon: (type) => ICONS[type],
  fieldIcon: Comment,
}
