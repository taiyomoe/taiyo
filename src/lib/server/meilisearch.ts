import type { Meilisearch } from "meilisearch";
import MeiliSearch from "meilisearch";

import type { MediasIndexItem } from "~/lib/types/meilisearch.types";

const globalForMeilisearch = globalThis as unknown as {
  meilisearch: Meilisearch | undefined;
};

export const meilisearch =
  globalForMeilisearch.meilisearch ??
  new MeiliSearch({
    // This hard-coded URL is needed so that MeiliSearch stops complaining when the app is building
    host: process.env.NEXT_PUBLIC_MEILISEARCH_URL! ?? "http://localhost:7700",
    apiKey: process.env.MEILISEARCH_ADMIN_KEY!,
  });

export const meilisearchIndexes = {
  medias: meilisearch.index<MediasIndexItem>("medias"),
};

if (process.env.NODE_ENV !== "production")
  globalForMeilisearch.meilisearch = meilisearch;
