"use client"

import type { TASKS_LIST_SORTABLE_FIELDS } from "@taiyomoe/constants"
import type { GetTasksListInput } from "@taiyomoe/schemas"
import type { SortingState } from "@tanstack/react-table"
import { type ReactNode, createContext, useContext, useRef } from "react"
import type { DefaultRuleGroupType } from "react-querybuilder"
import { createStore, useStore } from "zustand"
import { RQBUtils } from "~/utils/rqb.utils"

type Props = GetTasksListInput
type State = Props & {
  setFilter: (value: DefaultRuleGroupType) => void
  setSort: (value: SortingState) => void
  setPage: (value: number) => void
  setPerPage: (value: number) => void
}
type Store = ReturnType<typeof tasksListStore>

const tasksListStore = (initProps: Props) =>
  createStore<State>()((set, get) => ({
    ...initProps,

    setFilter: (value) => {
      const computed = RQBUtils.computeNewFilter(get().filter, value)

      if (computed === null) {
        return
      }

      set((state) => ({ ...state, filter: computed, page: 1 }))
    },
    setSort: (value) => {
      set((state) => ({
        ...state,
        sort: value.map((v) => [
          v.id as (typeof TASKS_LIST_SORTABLE_FIELDS)[number],
          v.desc ? "desc" : "asc",
        ]),
      }))
    },
    setPage: (value) => {
      set((state) => ({ ...state, page: value }))
    },
    setPerPage: (value) => {
      set((state) => ({ ...state, perPage: value, page: 1 }))
    },
  }))

/**
 * React part.
 */
export const TasksListStoreContext = createContext<Store | null>(null)

export const TasksListStoreProvider = ({
  children,
  value,
}: { children: ReactNode; value: Props }) => {
  const storeRef = useRef<Store>()

  if (!storeRef.current) {
    storeRef.current = tasksListStore(value)
  }

  return (
    <TasksListStoreContext.Provider value={storeRef.current}>
      {children}
    </TasksListStoreContext.Provider>
  )
}

export function useTasksListStore(): State
export function useTasksListStore<T>(selector?: (state: State) => T) {
  const store = useContext(TasksListStoreContext)

  if (!store) {
    throw new Error(
      "useTasksListStore must be used within a TasksListStoreProvider",
    )
  }

  return useStore(store, selector ?? ((s) => s as T))
}
