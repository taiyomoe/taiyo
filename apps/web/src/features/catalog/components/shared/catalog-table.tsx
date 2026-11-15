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
import { range } from "remeda"

type CatalogColumn = { key: string; label: ReactNode; sx?: Sx }

const styles = stylex.create({
  frame: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.card,
    minWidth: 0,
    overflowX: "auto",
  },
  table: {
    minWidth: "52rem",
  },
  skeleton: {
    height: "1rem",
    width: "70%",
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
  columns,
  loading,
  empty,
  children,
}: {
  columns: readonly CatalogColumn[]
  loading: boolean
  empty: {
    icon: (props: IconProps) => ReactElement
    title: string
    description: string
  } | null
  children: ReactNode
}) {
  if (empty !== null && !loading) {
    const Icon = empty.icon

    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
          <EmptyTitle>{empty.title}</EmptyTitle>
          <EmptyDescription>{empty.description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div sx={styles.frame}>
      <Table sx={styles.table}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} sx={column.sx}>
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
                    <TableCell key={column.key}>
                      <Skeleton sx={styles.skeleton} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : children}
        </TableBody>
      </Table>
    </div>
  )
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span sx={styles.srOnly}>{children}</span>
}
