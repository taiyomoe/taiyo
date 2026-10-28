import { m } from "@/paraglide/messages"

export const NO_VOLUME = "none"

export const getVolumeName = (volume: string | null) => {
  if (volume === null) {
    return m.media_chapters_no_volume()
  }

  return /^\d+(?:\.\d+)?$/.test(volume) ? m.media_chapters_volume({ volume }) : volume
}
