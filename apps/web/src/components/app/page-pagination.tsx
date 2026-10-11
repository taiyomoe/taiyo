import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@taiyomoe/ui/components/ui/pagination"
import { consts } from "@taiyomoe/ui/styles/tokens.stylex"

import { getPageCount, getPageItems } from "@/components/app/page-items"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    paddingTop: "1.5rem",
  },
  edgeLabel: {
    display: { default: "none", [consts.sm]: "inline" },
  },
})
const withPage =
  (page: number) =>
  <TSearch extends object>(previous: TSearch) => ({
    ...previous,
    page: page === 1 ? undefined : page,
  })

export function PagePagination({
  page,
  perPage,
  total,
}: {
  page: number
  perPage: number
  total: number
}) {
  const pageCount = getPageCount(total, perPage)

  if (pageCount <= 1) {
    return null
  }

  return (
    <Pagination aria-label={m.pagination_label()} sx={styles.root}>
      <PaginationContent>
        <PaginationItem>
          <Button
            aria-label={m.pagination_previous()}
            disabled={page <= 1}
            render={page > 1 ? <Link search={withPage(page - 1)} to="." /> : undefined}
            variant="ghost"
          >
            <ChevronLeft />
            <span sx={styles.edgeLabel}>{m.pagination_previous()}</span>
          </Button>
        </PaginationItem>
        {getPageItems(page, pageCount).map((item) => (
          <PaginationItem key={item}>
            {typeof item === "number" ? (
              <Button
                aria-current={item === page ? "page" : undefined}
                aria-label={m.pagination_page({ page: item })}
                render={<Link search={withPage(item)} to="." />}
                size="icon"
                variant={item === page ? "outline" : "ghost"}
              >
                {item}
              </Button>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <Button
            aria-label={m.pagination_next()}
            disabled={page >= pageCount}
            render={page < pageCount ? <Link search={withPage(page + 1)} to="." /> : undefined}
            variant="ghost"
          >
            <span sx={styles.edgeLabel}>{m.pagination_next()}</span>
            <ChevronRight />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
