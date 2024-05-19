import type {
  InferNestedPaths,
  InferNestedValues,
  ReaderSettings,
} from "@taiyomoe/types"
import { get as objGet, set as objSet, omit } from "radash"
import { create } from "zustand"
import { usePersistentReaderSettingsStore } from "~/stores/persistentReaderSettings.store"
import { useReaderStore } from "~/stores/reader.store"

type Actions = {
  update: (
    key: InferNestedPaths<ReaderSettings>,
    newValue: InferNestedValues<ReaderSettings>,
    persistent?: boolean,
  ) => void

  reset: (key: InferNestedPaths<ReaderSettings>) => void
}

export const useReaderSettingsStore = create<ReaderSettings & Actions>(
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

    update: (key, newValue, persistent = false) => {
      set((state) => {
        const newSettings = structuredClone(omit(state, ["update", "reset"]))

        objSet(newSettings, key, newValue)

        // If the user is trying to open the sidebar while the page overlay is open, close the overlay
        if (key === "sidebar.state" && newValue === "show") {
          objSet(newSettings, "page.overlay", "hide")
        }

        // If the user is trying to open the page overlay while the sidebar is open, stop him
        if (
          key === "page.overlay" &&
          newValue === "show" &&
          state.sidebar.state === "show"
        ) {
          return state
        }

        if (key === "page.mode" && newValue === "longstrip") {
          useReaderStore.getState().loadAllImages()
        }

        if (persistent) {
          usePersistentReaderSettingsStore.getState().update(key, newValue)
        }

        return {
          ...state,
          ...newSettings,
        }
      })
    },

    reset: (key) => {
      set((state) => {
        const newSettings = structuredClone(omit(state, ["update", "reset"]))

        objSet(
          newSettings,
          key,
          objGet(usePersistentReaderSettingsStore.getState(), key),
        )

        return {
          ...state,
          ...newSettings,
        }
      })
    },
  }),
)
