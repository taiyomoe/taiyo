"use client"

import type { CHAPTERS_LIST_SORTABLE_FIELDS } from "@taiyomoe/constants"
import type { GetChaptersListInput } from "@taiyomoe/schemas"
import type { SortingState } from "@tanstack/react-table"
import { pick } from "radash"
import { type ReactNode, createContext, useContext, useRef } from "react"
import type { DefaultRuleGroupType } from "react-querybuilder"
import { createStore, useStore } from "zustand"
import { rqbFilterTransformer } from "~/utils/rqb-filter-transformer"

type Props = { input: GetChaptersListInput }
type State = Props & {
  setFilter: (value: DefaultRuleGroupType) => void
  setSort: (value: SortingState) => void
  setPage: (value: number) => void
  setPerPage: (value: number) => void
}
type Store = ReturnType<typeof chaptersListStore>

const chaptersListStore = (initProps: Props) =>
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
            v.id as (typeof CHAPTERS_LIST_SORTABLE_FIELDS)[number],
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
const ChaptersListStoreContext = createContext<Store | null>(null)

export const ChaptersListStoreProvider = ({
  children,
  value,
}: { children: ReactNode; value: Props }) => {
  const storeRef = useRef<Store>()

  if (!storeRef.current) {
    storeRef.current = chaptersListStore(value)
  }

  return (
    <ChaptersListStoreContext.Provider value={storeRef.current}>
      {children}
    </ChaptersListStoreContext.Provider>
  )
}

export function useChaptersListStore(): State
export function useChaptersListStore<T>(selector?: (state: State) => T) {
  const store = useContext(ChaptersListStoreContext)

  if (!store) {
    throw new Error(
      "useChaptersListStore must be used within a ChaptersListStoreProvider",
    )
  }

  return useStore(store, selector ?? ((s) => s as T))
}
