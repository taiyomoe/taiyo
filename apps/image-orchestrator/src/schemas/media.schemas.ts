import { z } from "nestjs-zod/z"

export const mediaGenresSchema = z.enum([
  "ACTION",
  "ADVENTURE",
  "COMEDY",
  "DRAMA",
  "ECCHI",
  "FANTASY",
  "HENTAI",
  "HORROR",
  "MAHOU_SHOUJO",
  "MECHA",
  "MUSIC",
  "MYSTERY",
  "PSYCHOLOGICAL",
  "ROMANCE",
  "SCI_FI",
  "SLICE_OF_LIFE",
  "SPORTS",
  "SUPERNATURAL",
  "THRILLER",
])
