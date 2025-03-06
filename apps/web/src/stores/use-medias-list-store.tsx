"use client"

import type { MEDIAS_LIST_SORTABLE_FIELDS } from "@taiyomoe/constants"
import type { GetMediasListInput } from "@taiyomoe/schemas"
import type { SortingState } from "@tanstack/react-table"
import { pick } from "radash"
import { type ReactNode, createContext, useContext, useRef } from "react"
import type { DefaultRuleGroupType } from "react-querybuilder"
import { createStore, useStore } from "zustand"
import { rqbFilterTransformer } from "~/utils/rqb-filter-transformer"

type Props = { input: GetMediasListInput }
type State = Props & {
  setFilter: (value: DefaultRuleGroupType) => void
  setSort: (value: SortingState) => void
  setPage: (value: number) => void
  setPerPage: (value: number) => void
}
type Store = ReturnType<typeof mediasListStore>

const mediasListStore = (initProps: Props) =>
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
            v.id as (typeof MEDIAS_LIST_SORTABLE_FIELDS)[number],
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
const MediasListStoreContext = createContext<Store | null>(null)

export const MediasListStoreProvider = ({
  children,
  value,
}: { children: ReactNode; value: Props }) => {
  const storeRef = useRef<Store>(null)

  if (!storeRef.current) {
    storeRef.current = mediasListStore(value)
  }

  return (
    <MediasListStoreContext.Provider value={storeRef.current}>
      {children}
    </MediasListStoreContext.Provider>
  )
}

export function useMediasListStore(): State
export function useMediasListStore<T>(selector?: (state: State) => T) {
  const store = useContext(MediasListStoreContext)

  if (!store) {
    throw new Error(
      "useMediasListStore must be used within a MediasListStoreProvider",
    )
  }

  return useStore(store, selector ?? ((s) => s as T))
}
