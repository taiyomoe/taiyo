import { useRouter, useSearchParams } from "next/navigation";

import { DEFAULT_MEDIA_PAGE } from "~/lib/constants";
import { mediaPaginationSchema } from "~/lib/schemas";

export const useChapterPagination = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { page, perPage } = mediaPaginationSchema.parse({
    page: searchParams.get("page"),
    perPage: searchParams.get("per_page"),
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
