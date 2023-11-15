"use client";

import { useCallback } from "react";
import {
  parseAsInteger,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";

import { DEFAULT_MEDIA_PAGE } from "~/lib/constants";
import type { MediaTabs } from "~/lib/types";

export const useMediaNavigation = () => {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringEnum<MediaTabs>(["info", "chapters"]).withDefault("chapters"),
  );
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(DEFAULT_MEDIA_PAGE),
  );
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(5),
  );

  const handlePerPageChange = useCallback(
    async (newPerPage: number) => {
      await setPage(DEFAULT_MEDIA_PAGE);
      await setPerPage(newPerPage);
    },
    [setPage, setPerPage],
  );

  return { tab, setTab, page, setPage, perPage, handlePerPageChange };
};
