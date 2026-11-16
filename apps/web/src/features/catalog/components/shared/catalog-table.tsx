import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Frame, FrameFooter } from "@taiyomoe/ui/components/ui/frame"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@taiyomoe/ui/components/ui/table"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { createContext, use } from "react"
import { range } from "remeda"
import { type CatalogBreakpoint, catalogShownFrom } from "@/features/catalog/lib/catalog-styles"
import { catalogContainers } from "@/features/catalog/lib/catalog.stylex"

export type CatalogColumn = {
  key: string
  label: ReactNode
  width?: Sx
  /** Hides the column while the table is narrower than this breakpoint. */
  from?: CatalogBreakpoint
}

const ColumnsContext = createContext<ReadonlyMap<string, CatalogColumn>>(new Map())
const styles = stylex.create({
  frame: {
    containerType: "inline-size",
    minWidth: 0,
  },
  table: {
    tableLayout: "fixed",
  },
  head: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cell: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  skeleton: {
    height: "1rem",
    width: "70%",
  },
  empty: {
    borderColor: colors.border,
    borderRadius: `calc(${radius.xxl} - 0.25rem)`,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.card,
  },
  footer: {
    gap: "0.75rem",
    paddingBlock: "0.75rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexDirection: {
      default: "row",
      [catalogContainers.narrow]: "column",
      [catalogContainers.medium]: "column",
    },
    justifyContent: "space-between",
  },
  pages: {
    flexShrink: 0,
  },
  count: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
  },
  srOnly: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: "1px",
    width: "1px",
  },
})

export function CatalogTable({
  toolbar,
  columns,
  loading,
  empty,
  footer,
  children,
}: {
  toolbar: ReactNode
  columns: readonly CatalogColumn[]
  loading: boolean
  empty: {
    icon: (props: IconProps) => ReactElement
    title: string
    description: string
  } | null
  footer: ReactNode
  children: ReactNode
}) {
  const Icon = empty?.icon

  return (
    <Frame sx={styles.frame}>
      {toolbar}
      {empty !== null && Icon !== undefined && !loading ? (
        <Empty sx={styles.empty}>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon />
            </EmptyMedia>
            <EmptyTitle>{empty.title}</EmptyTitle>
            <EmptyDescription>{empty.description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ColumnsContext value={new Map(columns.map((column) => [column.key, column]))}>
          <Table sx={styles.table} variant="card">
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    sx={[
                      styles.head,
                      column.width,
                      column.from === undefined ? null : catalogShownFrom[column.from],
                    ]}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? range(0, 8).map((row) => (
                    <TableRow key={row}>
                      {columns.map((column) => (
                        <CatalogCell column={column.key} key={column.key}>
                          <Skeleton sx={styles.skeleton} />
                        </CatalogCell>
                      ))}
                    </TableRow>
                  ))
                : children}
            </TableBody>
          </Table>
        </ColumnsContext>
      )}
      {footer}
    </Frame>
  )
}

/** A body cell that follows the visibility of its column. */
export function CatalogCell({
  column,
  sx,
  children,
}: {
  column: string
  sx?: Sx
  children?: ReactNode
}) {
  const from = use(ColumnsContext).get(column)?.from

  return (
    <TableCell sx={[styles.cell, from === undefined ? null : catalogShownFrom[from], sx]}>
      {children}
    </TableCell>
  )
}

export function CatalogFooter({ total, children }: { total: string; children: ReactNode }) {
  return (
    <FrameFooter sx={styles.footer}>
      <span sx={styles.count}>{total}</span>
      <div sx={styles.pages}>{children}</div>
    </FrameFooter>
  )
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span sx={styles.srOnly}>{children}</span>
}
