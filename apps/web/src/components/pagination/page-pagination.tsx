import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@taiyomoe/ui/components/ui/pagination"
import { PageJump } from "@/components/pagination/page-jump"
import { paginationStyles } from "@/components/pagination/pagination-styles"
import { getPageItems } from "@/lib/pagination"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  content: {
    gap: { default: "0.125rem", "@media (width >= 40rem)": "0.25rem" },
    justifyContent: "center",
  },
  edge: {
    height: { default: null, "@media (width < 40rem)": "2rem" },
    width: { default: null, "@media (width < 40rem)": "2rem" },
  },
  disabled: {
    opacity: 0.4,
    pointerEvents: "none",
  },
})

type PagePaginationProps = {
  page: number
  pageCount: number
  renderLink: (page: number) => ReactElement
  onJump: (page: number) => void
}

export function PagePagination({ page, pageCount, renderLink, onJump }: PagePaginationProps) {
  if (pageCount <= 1) {
    return null
  }

  return (
    <Pagination aria-label={m.pagination_label()}>
      <PaginationContent sx={styles.content}>
        <PaginationItem {...stylex.props(page <= 1 && styles.disabled)}>
          <PaginationPrevious
            aria-disabled={page <= 1 || undefined}
            render={page <= 1 ? <span /> : renderLink(page - 1)}
            sx={styles.edge}
          />
        </PaginationItem>
        {getPageItems(page, pageCount).map((item) =>
          typeof item === "number" ? (
            <PaginationItem key={item}>
              <PaginationLink
                aria-label={m.pagination_page({ page: item })}
                isActive={item === page}
                render={renderLink(item)}
                sx={paginationStyles.page}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={`gap-${item.gapAfter}`}>
              <PageJump onJump={onJump} pageCount={pageCount} />
            </PaginationItem>
          ),
        )}
        <PaginationItem {...stylex.props(page >= pageCount && styles.disabled)}>
          <PaginationNext
            aria-disabled={page >= pageCount || undefined}
            render={page >= pageCount ? <span /> : renderLink(page + 1)}
            sx={styles.edge}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
