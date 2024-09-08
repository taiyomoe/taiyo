import {
  type CHAPTERS_LIST_SORTABLE_FIELDS,
  DEFAULT_CHAPTERS_LIST_PER_PAGE,
} from "@taiyomoe/constants"
import type { SortingState } from "@tanstack/react-table"
import type { DefaultRuleGroupType } from "react-querybuilder"
import { create } from "zustand"
import { RQBUtils } from "~/utils/rqb.utils"

type State = {
  query: string
  sort: [(typeof CHAPTERS_LIST_SORTABLE_FIELDS)[number], "asc" | "desc"][]
  page: number
  perPage: number
}

type Actions = {
  setQuery: (value: DefaultRuleGroupType) => void
  setSort: (value: SortingState) => void
  setPage: (value: number) => void
  setPerPage: (value: number) => void
}

export const useChaptersListStore = create<State & Actions>((set, get) => ({
  query: "deletedAt = null",
  sort: [],
  page: 1,
  perPage: DEFAULT_CHAPTERS_LIST_PER_PAGE,

  setQuery: (value) => {
    const computed = RQBUtils.computeNewQuery(get().query, value)

    if (computed === null) {
      return
    }

    set((state) => ({ ...state, query: computed, page: 1 }))
  },
  setSort: (value) => {
    set((state) => ({
      ...state,
      sort: value.map((v) => [
        v.id as (typeof CHAPTERS_LIST_SORTABLE_FIELDS)[number],
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
