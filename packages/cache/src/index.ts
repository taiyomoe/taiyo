import type { Languages } from "@taiyomoe/db"
import type { FeaturedMedia, LatestMedia } from "@taiyomoe/types"
import DF from "ioredis"
import { env } from "../env"
import { parseCache } from "./utils"

const HOUR = 60 * 60
const DAY = 60 * 60 * 24
const client = new DF({ port: env.DRAGONFLY_PORT })

export const cacheClient = {
  medias: {
    latest: {
      get: () => parseCache<LatestMedia[]>(client.get("medias:latest")),
      set: (input: LatestMedia[]) =>
        client.setex("medias:latest", HOUR, JSON.stringify(input)),
    },
    featured: (lang: Languages) => ({
      get: () =>
        parseCache<FeaturedMedia[]>(client.get(`medias:featured:${lang}`)),
      set: (input: FeaturedMedia[]) =>
        client.setex(`medias:featured:${lang}`, DAY, JSON.stringify(input)),
    }),
  },
}

export const rawCacheClient = client
