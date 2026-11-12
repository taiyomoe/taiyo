import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link, useRouteContext } from "@tanstack/react-router"
import { AppShell } from "@/components/shell/app-shell"
import { getApiErrorCode } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    paddingBlock: "2rem",
    paddingInline: { default: "1.25rem", [breakpoints.md]: "2rem" },
  },
})

export const isNotFoundError = (error: unknown, code: string) => {
  const errorCode = getApiErrorCode(error)

  return errorCode === code || errorCode === "VALIDATION_ERROR"
}

export function NotFoundPage({
  icon,
  title,
  description,
  back,
}: {
  icon: ReactNode
  title: string
  description: string
  back: { label: string; to: "/" | "/groups" | "/lists" }
}) {
  const { session } = useRouteContext({ from: "__root__" })

  return (
    <AppShell user={session?.user ?? null}>
      <div sx={styles.page}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">{icon}</EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link to={back.to} />} size="sm" variant="outline">
              {back.label}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </AppShell>
  )
}

export function PageNotFound() {
  return (
    <NotFoundPage
      back={{ label: m.not_found_back_home(), to: "/" }}
      description={m.page_not_found_description()}
      icon={<Search />}
      title={m.page_not_found_title()}
    />
  )
}
