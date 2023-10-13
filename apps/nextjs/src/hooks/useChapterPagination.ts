"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  DEFAULT_MEDIA_PAGE,
  DEFAULT_MEDIA_PER_PAGE,
  mediaPaginationSchema,
} from "@taiyo/utils";

export const useChapterPagination = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // TODO - somehow zod's .default() is not working
  const { page, perPage } = mediaPaginationSchema.parse({
    page: searchParams.get("page") ?? DEFAULT_MEDIA_PAGE,
    perPage: searchParams.get("per_page") ?? DEFAULT_MEDIA_PER_PAGE,
  });

  const handlePageChange = (newPage: number) => {
    router.push(`?page=${newPage}&per_page=${perPage}`, {
      scroll: false,
    });
  };

  const handlePerPageChange = (newPerPage: string) => {
    router.push(`?page=${DEFAULT_MEDIA_PAGE}&per_page=${newPerPage}`, {
      scroll: false,
    });
  };

  return { page, perPage, handlePageChange, handlePerPageChange };
};
