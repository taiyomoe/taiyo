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
import { breakpoints, containers } from "@taiyomoe/ui/styles/tokens.stylex"
import { PageJump } from "@/components/pagination/page-jump"
import { paginationStyles } from "@/components/pagination/pagination-styles"
import { getPageItems } from "@/lib/pagination"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  content: {
    gap: { default: "0.125rem", [breakpoints.sm]: "0.25rem" },
    justifyContent: "center",
  },
  edge: {
    height: { default: null, [breakpoints.maxSm]: "2rem" },
    width: { default: null, [breakpoints.maxSm]: "2rem" },
  },
  // Sized against the nearest container, for paginations that sit in a narrow table.
  edgeFit: {
    aspectRatio: { default: "1", [containers.xl]: "auto" },
    height: "2rem",
    width: { default: "2rem", [containers.xl]: "auto" },
  },
  labelFit: {
    display: { default: "none", [containers.xl]: "inline" },
  },
  disabled: {
    opacity: 0.4,
    pointerEvents: "none",
  },
})

export function PagePagination({
  page,
  pageCount,
  renderLink,
  onJump,
  fit = "viewport",
}: {
  page: number
  pageCount: number
  renderLink: (page: number) => ReactElement
  onJump: (page: number) => void
  /** What decides whether the previous and next buttons show their label. */
  fit?: "viewport" | "container"
}) {
  const edge = fit === "container" ? styles.edgeFit : styles.edge
  const label = fit === "container" ? styles.labelFit : undefined

  if (pageCount <= 1) {
    return null
  }

  return (
    <Pagination aria-label={m.pagination_label()}>
      <PaginationContent sx={styles.content}>
        <PaginationItem {...stylex.props(page <= 1 && styles.disabled)}>
          <PaginationPrevious
            aria-label={m.pagination_previous_page()}
            label={m.pagination_previous()}
            labelSx={label}
            aria-disabled={page <= 1 || undefined}
            render={page <= 1 ? <span /> : renderLink(page - 1)}
            sx={edge}
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
            aria-label={m.pagination_next_page()}
            label={m.pagination_next()}
            labelSx={label}
            aria-disabled={page >= pageCount || undefined}
            render={page >= pageCount ? <span /> : renderLink(page + 1)}
            sx={edge}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
