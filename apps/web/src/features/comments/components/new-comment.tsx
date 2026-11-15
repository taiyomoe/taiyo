import * as stylex from "@stylexjs/stylex"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { CommentTarget } from "@/features/comments/lib/comment-target"
import type { Session } from "@/lib/session"
import { useCreateComment } from "@/features/comments/api/comments"
import { CommentComposer } from "@/features/comments/components/comment-composer"
import { commentStyles } from "@/features/comments/components/comment-styles"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "0.875rem",
    alignItems: "flex-start",
    display: "flex",
  },
  composer: {
    flexGrow: 1,
    minWidth: 0,
  },
  signIn: {
    margin: 0,
    borderRadius: radius.xl,
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
  link: {
    color: colors.foreground,
    fontWeight: 600,
  },
})

export function NewComment({
  target,
  viewer,
}: {
  target: CommentTarget
  viewer: Session["user"] | null
}) {
  const create = useCreateComment(target)

  if (viewer === null) {
    return (
      <p sx={styles.signIn}>
        <Link to="/auth/sign-in" {...stylex.props(styles.link)}>
          {m.comments_sign_in_link()}
        </Link>{" "}
        {m.comments_sign_in()}
      </p>
    )
  }

  return (
    <div sx={styles.root}>
      <PersonAvatar
        person={{
          id: viewer.id,
          displayUsername: viewer.displayUsername ?? viewer.name,
          image: viewer.image ?? null,
        }}
        sx={commentStyles.avatar}
      />
      <div sx={styles.composer}>
        <CommentComposer
          error={create.isError ? getErrorMessage(create.error) : null}
          onSubmit={(content) => create.mutateAsync(content)}
          pending={create.isPending}
          placeholder={m.comments_placeholder()}
          submitLabel={m.comments_post()}
        />
      </div>
    </div>
  )
}
