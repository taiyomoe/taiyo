import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useRouteContext } from "@tanstack/react-router"
import { AppShell } from "@/components/shell/app-shell"
import { ListNotFound } from "@/features/lists/components/list-page/list-error"

const styles = stylex.create({
  page: {
    paddingBlock: "2rem",
    paddingInline: { default: "1.25rem", [breakpoints.md]: "2rem" },
  },
})

export function ListNotFoundPage() {
  const { session } = useRouteContext({ from: "__root__" })

  return (
    <AppShell user={session?.user ?? null}>
      <div sx={styles.page}>
        <ListNotFound />
      </div>
    </AppShell>
  )
}
