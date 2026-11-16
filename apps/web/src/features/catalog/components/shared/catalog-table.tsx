import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Frame, FrameFooter } from "@taiyomoe/ui/components/ui/frame"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@taiyomoe/ui/components/ui/table"
import { colors, containers, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { createContext, use } from "react"
import { range } from "remeda"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import {
  SkeletonCheckbox,
  SkeletonText,
} from "@/features/catalog/components/shared/catalog-skeletons"
import { type CatalogBreakpoint, catalogShownFrom } from "@/features/catalog/lib/catalog-styles"
import { m } from "@/paraglide/messages"

export type CatalogColumn = {
  key: string
  label: ReactNode
  width?: Sx
  /** Hides the column while the table is narrower than this breakpoint. */
  from?: CatalogBreakpoint
  /** What the column shows while the rows load, sized like its real content. */
  skeleton?: ReactNode
}

const SELECT_COLUMN = "select"
const SKELETON_ROWS = 10
const ColumnsContext = createContext<ReadonlyMap<string, CatalogColumn>>(new Map())
const styles = stylex.create({
  section: {
    gap: "1rem",
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  frame: {
    containerType: "inline-size",
    minWidth: 0,
  },
  table: {
    tableLayout: "fixed",
  },
  colSelect: {
    width: "2.75rem",
  },
  head: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cell: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  body: {
    opacity: { default: 1, ":is([data-stale])": 0.55 },
    transitionDuration: "150ms",
    transitionProperty: "opacity",
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
    flexDirection: { default: "column", [containers["3xl"]]: "row" },
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
  selection,
  columns: ownColumns,
  loading,
  fetching = false,
  empty,
  footer,
  bulkBar,
  children,
}: {
  toolbar: ReactNode
  /** Adds a leading checkbox column. */
  selection?: Selection | undefined
  columns: readonly CatalogColumn[]
  loading: boolean
  /** Placeholder rows are on screen while the next page or filter loads. */
  fetching?: boolean
  empty: {
    icon: (props: IconProps) => ReactElement
    title: string
    description: string
  } | null
  footer: ReactNode
  bulkBar?: ReactNode
  children: ReactNode
}) {
  const Icon = empty?.icon
  const columns: readonly CatalogColumn[] =
    selection === undefined
      ? ownColumns
      : [
          {
            key: SELECT_COLUMN,
            label: (
              <Checkbox
                aria-label={m.catalog_select_all()}
                checked={selection.header.checked}
                indeterminate={selection.header.indeterminate}
                onCheckedChange={selection.header.onToggle}
              />
            ),
            width: styles.colSelect,
            skeleton: <SkeletonCheckbox />,
          },
          ...ownColumns,
        ]

  return (
    <section sx={styles.section}>
      {toolbar}
      <Frame sx={styles.frame}>
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
              <TableBody
                aria-busy={loading || fetching}
                data-stale={fetching && !loading ? "" : undefined}
                sx={styles.body}
              >
                {loading
                  ? range(0, SKELETON_ROWS).map((row) => (
                      <TableRow key={row}>
                        {columns.map((column) => (
                          <CatalogCell column={column.key} key={column.key}>
                            {column.skeleton ?? <SkeletonText />}
                          </CatalogCell>
                        ))}
                      </TableRow>
                    ))
                  : children}
              </TableBody>
            </Table>
          </ColumnsContext>
        )}
        {loading ? (
          <FrameFooter sx={styles.footer}>
            <span sx={styles.count}>
              <SkeletonText width="6rem" />
            </span>
          </FrameFooter>
        ) : (
          footer
        )}
      </Frame>
      {bulkBar}
    </section>
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

/** The checkbox that adds a row to the selection. */
export function CatalogSelectCell({
  selection,
  id,
  label,
  disabled = false,
}: {
  selection: Selection
  id: string
  label: string
  /** The row is listed but no bulk action applies to it. */
  disabled?: boolean
}) {
  return (
    <CatalogCell column={SELECT_COLUMN}>
      <Checkbox
        aria-label={m.catalog_select_row({ name: label })}
        checked={!disabled && selection.has(id)}
        disabled={disabled}
        onCheckedChange={() => {
          selection.toggle(id)
        }}
      />
    </CatalogCell>
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
