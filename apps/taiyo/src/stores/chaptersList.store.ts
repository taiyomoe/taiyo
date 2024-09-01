import { DEFAULT_CHAPTERS_LIST_PER_PAGE } from "@taiyomoe/constants"
import type { DefaultRuleGroupType } from "react-querybuilder"
import { create } from "zustand"
import { RQBUtils } from "~/utils/rqb.utils"

type State = {
  query: string
  page: number
  perPage: number
}

type Actions = {
  setPage: (value: number) => void
  setPerPage: (value: number) => void
  setQuery: (value: DefaultRuleGroupType) => void
}

export const useChaptersListStore = create<State & Actions>((set, get) => ({
  query: "",
  page: 1,
  perPage: DEFAULT_CHAPTERS_LIST_PER_PAGE,

  setPage: (value) => {
    set((state) => ({ ...state, page: value }))
  },
  setPerPage: (value) => {
    set((state) => ({ ...state, perPage: value, page: 1 }))
  },
  setQuery: (value) => {
    const computed = RQBUtils.computeNewQuery(get().query, value)

    if (!computed) {
      return
    }

    set((state) => ({ ...state, query: computed, page: 1 }))
  },
}))
