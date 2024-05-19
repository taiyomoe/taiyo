import type { MediaCover, MediaTitle } from "@prisma/client"
import type { UpdateCoverInput, UpdateTitleInput } from "@taiyomoe/schemas"
import type { MediaWithRelations } from "@taiyomoe/types"
import { create } from "zustand"

export type MediaUpdateState = {
  titles: MediaTitle[]
  covers: MediaCover[]

  load: (media: MediaWithRelations) => void

  addTitle: (payload: MediaTitle) => void
  updateTitle: (payload: UpdateTitleInput) => void

  addCover: (payload: MediaCover[]) => void
  updateCover: (payload: UpdateCoverInput) => void

  del: (type: "title" | "cover", id: string) => void
}

export const useMediaUpdateStore = create<MediaUpdateState>((set) => ({
  titles: [],
  covers: [],

  load: (media) => {
    set({
      titles: media.titles,
      covers: media.covers,
    })
  },

  addTitle: (payload) => {
    set((prev) => ({
      titles: [
        ...prev.titles.map((t) => ({
          ...t,
          isMainTitle: payload.isMainTitle ? false : t.isMainTitle,
        })),
        payload,
      ],
    }))
  },
  updateTitle: (payload) => {
    set((state) => ({
      titles: state.titles.map((title) => {
        if (title.id === payload.id) {
          return {
            ...title,
            ...payload,
          }
        }

        return {
          ...title,
          isMainTitle: payload.isMainTitle ? false : title.isMainTitle,
        }
      }),
    }))
  },

  addCover: (payload) => {
    set((prev) => ({
      covers: [
        ...prev.covers.map((c) => ({
          ...c,
          isMainCover: payload.some((p) => p.isMainCover)
            ? false
            : c.isMainCover,
        })),
        ...payload,
      ],
    }))
  },
  updateCover: (payload) => {
    set((state) => ({
      covers: state.covers.map((cover) => {
        if (cover.id === payload.id) {
          return {
            ...cover,
            ...payload,
          }
        }

        return {
          ...cover,
          isMainCover: payload.isMainCover ? false : cover.isMainCover,
        }
      }),
    }))
  },

  del: (type, id) => {
    if (type === "title") {
      set((prev) => ({ titles: prev.titles.filter((t) => t.id !== id) }))
    } else {
      set((prev) => ({ covers: prev.covers.filter((c) => c.id !== id) }))
    }
  },
}))
