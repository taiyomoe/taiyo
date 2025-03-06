"use client"

import type { SCANS_LIST_SORTABLE_FIELDS } from "@taiyomoe/constants"
import type { GetScansListInput } from "@taiyomoe/schemas"
import type { SortingState } from "@tanstack/react-table"
import { pick } from "radash"
import { type ReactNode, createContext, useContext, useRef } from "react"
import type { DefaultRuleGroupType } from "react-querybuilder"
import { createStore, useStore } from "zustand"
import { rqbFilterTransformer } from "~/utils/rqb-filter-transformer"

type Props = { input: GetScansListInput }
type State = Props & {
  setFilter: (value: DefaultRuleGroupType) => void
  setSort: (value: SortingState) => void
  setPage: (value: number) => void
  setPerPage: (value: number) => void
}
type Store = ReturnType<typeof scansListStore>

const scansListStore = (initProps: Props) =>
  createStore<State>()((set) => ({
    ...initProps,

    setFilter: (value) => {
      set((state) => ({
        ...state,
        input: {
          page: 1,
          ...rqbFilterTransformer(value),
          ...pick(state.input, ["perPage", "sort"]),
        },
      }))
    },
    setSort: (value) => {
      set((state) => ({
        ...state,
        input: {
          ...state.input,
          sort: value.map((v) => [
            v.id as (typeof SCANS_LIST_SORTABLE_FIELDS)[number],
            v.desc ? "desc" : "asc",
          ]),
        },
      }))
    },
    setPage: (value) => {
      set((state) => ({ ...state, input: { ...state.input, page: value } }))
    },
    setPerPage: (value) => {
      set((state) => ({
        ...state,
        input: { ...state.input, perPage: value, page: 1 },
      }))
    },
  }))

/**
 * React part.
 */
const ScansListStoreContext = createContext<Store | null>(null)

export const ScansListStoreProvider = ({
  children,
  value,
}: { children: ReactNode; value: Props }) => {
  const storeRef = useRef<Store>(null)

  if (!storeRef.current) {
    storeRef.current = scansListStore(value)
  }

  return (
    <ScansListStoreContext.Provider value={storeRef.current}>
      {children}
    </ScansListStoreContext.Provider>
  )
}

export function useScansListStore(): State
export function useScansListStore<T>(selector?: (state: State) => T) {
  const store = useContext(ScansListStoreContext)

  if (!store) {
    throw new Error(
      "useScansListStore must be used within a ScansListStoreProvider",
    )
  }

  return useStore(store, selector ?? ((s) => s as T))
}
