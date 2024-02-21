import type { ReaderSettings } from "@taiyomoe/types"
import _ from "lodash-es"
import { create } from "zustand"
import { InferNestedPaths, InferNestedValues } from "~/lib/types"
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
        const newSettings = structuredClone(_.omit(state, "update", "reset"))

        console.log("Updating", key, "to", newValue)

        _.set(newSettings, key, newValue)

        // If the user is trying to open the sidebar while the page overlay is open, close the overlay
        if (key === "sidebar.state" && newValue === "show") {
          _.set(newSettings, "page.overlay", "hide")
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
          console.log("Updating persistent settings", key, "to", newValue)

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
        const newSettings = structuredClone(_.omit(state, "update", "reset"))

        _.set(
          newSettings,
          key,
          _.get(usePersistentReaderSettingsStore.getState(), key),
        )

        return {
          ...state,
          ...newSettings,
        }
      })
    },
  }),
)
