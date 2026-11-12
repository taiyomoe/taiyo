import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { DeleteListButton } from "@/features/lists/components/list-editor/delete-list-button"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  bar: {
    gap: "0.5rem",
    marginInline: { default: "-1.25rem", [breakpoints.md]: "-2rem" },
    paddingBlock: "0.75rem",
    paddingInline: { default: "1.25rem", [breakpoints.md]: "2rem" },
    alignItems: "center",
    backdropFilter: "blur(12px)",
    backgroundColor: `color-mix(in srgb, ${colors.background} 88%, transparent)`,
    display: "flex",
    position: "sticky",
    zIndex: 2,
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    bottom: 0,
  },
  end: {
    gap: "0.5rem",
    display: "flex",
    marginInlineStart: "auto",
  },
})

export function EditorBar({
  list,
  submitting,
}: {
  list: { id: string; name: string } | null
  submitting: boolean
}) {
  return (
    <div sx={styles.bar}>
      {list === null ? null : <DeleteListButton list={list} />}
      <div sx={styles.end}>
        <Button
          render={
            list === null ? (
              <Link to="/lists" />
            ) : (
              <Link params={{ listId: list.id }} to="/lists/$listId" />
            )
          }
          variant="outline"
        >
          {m.cancel()}
        </Button>
        <Button loading={submitting} type="submit">
          {list === null ? m.list_editor_create() : m.list_editor_save()}
        </Button>
      </div>
    </div>
  )
}
