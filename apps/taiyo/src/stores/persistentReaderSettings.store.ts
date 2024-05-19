import type {
  InferNestedPaths,
  InferNestedValues,
  ReaderSettings,
} from "@taiyomoe/types"
import { set as objSet, omit } from "radash"
import { create } from "zustand"
import { persist } from "zustand/middleware"

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
          const newSettings = structuredClone(omit(state, ["update"]))

          objSet(newSettings, key, newValue)

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
