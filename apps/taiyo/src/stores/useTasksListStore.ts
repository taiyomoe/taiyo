import {
  DEFAULT_TASKS_LIST_PER_PAGE,
  type TASKS_LIST_SORTABLE_FIELDS,
} from "@taiyomoe/constants"
import type { SortingState } from "@tanstack/react-table"
import type { DefaultRuleGroupType } from "react-querybuilder"
import { create } from "zustand"
import { RQBUtils } from "~/utils/rqb.utils"

type State = {
  filter: string
  sort: [(typeof TASKS_LIST_SORTABLE_FIELDS)[number], "asc" | "desc"][]
  page: number
  perPage: number
}

type Actions = {
  setFilter: (value: DefaultRuleGroupType) => void
  setSort: (value: SortingState) => void
  setPage: (value: number) => void
  setPerPage: (value: number) => void
}

export const useTasksListStore = create<State & Actions>((set, get) => ({
  filter: "",
  sort: [],
  page: 1,
  perPage: DEFAULT_TASKS_LIST_PER_PAGE,

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
    console.log("new page", value)

    set((state) => ({ ...state, page: value }))
  },
  setPerPage: (value) => {
    set((state) => ({ ...state, perPage: value, page: 1 }))
  },
}))
