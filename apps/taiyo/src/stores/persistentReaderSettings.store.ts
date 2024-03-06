import type { ReaderSettings } from "@taiyomoe/types"
import _ from "lodash-es"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { InferNestedPaths, InferNestedValues } from "~/lib/types"

type Actions = {
  update: (
    key: InferNestedPaths<ReaderSettings>,
    newValue: InferNestedValues<ReaderSettings>,
  ) => void
}

export const usePersistentReaderSettingsStore = create<
  ReaderSettings & Actions
>()(
  persist(
    (set) => ({
      sidebar: {
        state: "hide",
        side: "right",
        openMode: "button",
      },
      navbarMode: "hover",
      page: {
        mode: "single",
        overlay: "hide",
        height: "fit",
        width: "fit",
        brightness: 100,
      },

      update: (key, newValue) => {
        set((state) => {
          const newSettings = structuredClone(_.omit(state, "update"))

          _.set(newSettings, key, newValue)

          return {
            ...state,
            ...newSettings,
          }
        })
      },
    }),
    {
      name: "reader-settings",
    },
  ),
)
