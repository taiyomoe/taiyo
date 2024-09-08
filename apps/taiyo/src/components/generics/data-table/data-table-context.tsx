import type { Table } from "@tanstack/react-table"
import { createContext, useContext } from "react"

type ContextType<TData> = { table: Table<TData> } | null

// biome-ignore lint/suspicious/noExplicitAny: this type-unaware context is fine because the we have the hook to assert the type
export const DataTableContext = createContext<ContextType<any>>(null)

export const useDataTable = <TData,>() => {
  const ctx = useContext<ContextType<TData>>(DataTableContext)

  if (!ctx) {
    throw new Error(
      "useDataTable has to be used within <DataTableContext.Provider>",
    )
  }

  return ctx.table
}
