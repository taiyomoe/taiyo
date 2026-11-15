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
import { Link, useRouteContext } from "@tanstack/react-router"
import { layout } from "@/components/layout/layout.stylex"
import { AppShell } from "@/components/shell/app-shell"
import { getApiErrorCode } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    paddingBlock: "2rem",
    paddingInline: layout.gutter,
  },
})

export const isNotFoundError = (error: unknown, code: string) => {
  const errorCode = getApiErrorCode(error)

  return errorCode === code || errorCode === "VALIDATION_ERROR"
}

type NotFoundProps = {
  icon: ReactNode
  title: string
  description: string
  back: {
    label: string
    to: "/" | "/groups" | "/lists" | "/titles" | "/dashboard/groups" | "/dashboard/suggestions"
  }
}

export function NotFoundContent({ icon, title, description, back }: NotFoundProps) {
  return (
    <div sx={styles.page}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon}</EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link to={back.to} />} variant="outline">
            {back.label}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export function NotFoundPage(props: NotFoundProps) {
  const { session } = useRouteContext({ from: "__root__" })

  return (
    <AppShell user={session?.user ?? null}>
      <NotFoundContent {...props} />
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
