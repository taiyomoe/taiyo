import { DEFAULT_CHAPTERS_LIST_PER_PAGE } from "@taiyomoe/constants"
import { useAtom, useAtomValue } from "jotai"
import { parseAsBoolean, useQueryState } from "nuqs"
import { useCallback } from "react"
import { useDebounceCallback } from "usehooks-ts"
import {
  chaptersListInitialDataAtom,
  chaptersListLoadingAtom,
} from "~/atoms/chaptersList.atoms"
import { api } from "~/trpc/react"
import {
  contentRatingsParser,
  flagsParser,
  intsParser,
  languagesParser,
  pageParser,
  perPageParser,
  uuidsParser,
} from "~/utils/nuqsParsers"

export const useChaptersList = () => {
  const initialItems = useAtomValue(chaptersListInitialDataAtom)
  const [isInternallyLoading, setIsInternallyLoading] = useAtom(
    chaptersListLoadingAtom,
  )

  const [numbers, setNumbers] = useQueryState("numbers", intsParser)
  const [notNumbers, setNotNumbers] = useQueryState("notNumbers", intsParser)
  const [volumes, setVolumes] = useQueryState("volumes", intsParser)
  const [notVolumes, setNotVolumes] = useQueryState("notVolumes", intsParser)
  const [languages, setLanguages] = useQueryState("languages", languagesParser)
  const [notLanguages, setNotLanguages] = useQueryState(
    "notLanguages",
    languagesParser,
  )
  const [contentRatings, setContentRatings] = useQueryState(
    "contentRatings",
    contentRatingsParser,
  )
  const [notContentRatings, setNotContentRatings] = useQueryState(
    "notContentRatings",
    contentRatingsParser,
  )
  const [flags, setFlags] = useQueryState("flags", flagsParser)
  const [notFlags, setNotFlags] = useQueryState("notFlags", flagsParser)
  const [uploaderIds, setUploaderIds] = useQueryState(
    "uploaderIds",
    uuidsParser,
  )
  const [notUploaderIds, setNotUploaderIds] = useQueryState(
    "notUploaderIds",
    uuidsParser,
  )
  const [mediaIds, setMediaIds] = useQueryState("mediaIds", uuidsParser)
  const [notMediaIds, setNotMediaIds] = useQueryState(
    "notMediaIds",
    uuidsParser,
  )
  const [scanIds, setScanIds] = useQueryState("scanIds", uuidsParser)
  const [notScanIds, setNotScanIds] = useQueryState("notScanIds", uuidsParser)
  const [deleterIds, setDeleterIds] = useQueryState("deleterIds", uuidsParser)
  const [notDeleterIds, setNotDeleterIds] = useQueryState(
    "notDeleterIds",
    uuidsParser,
  )
  const [includeDeleted, setIncludeDeleted] = useQueryState(
    "includeDeleted",
    parseAsBoolean.withDefault(false),
  )
  const [page, setPage] = useQueryState("page", pageParser)
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    perPageParser(DEFAULT_CHAPTERS_LIST_PER_PAGE),
  )

  const {
    data: { chapters: items, totalPages },
    refetch,
  } = api.chapters.getList.useQuery(
    { page, perPage },
    { initialData: initialItems, refetchOnMount: false, enabled: false },
  )

  const handleSearch = useDebounceCallback(
    useCallback(async () => {
      await refetch()
      setIsInternallyLoading(false)
    }, [refetch, setIsInternallyLoading]),
    300,
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      setIsInternallyLoading(true)
      handleSearch()
    },
    [setPage, setIsInternallyLoading, handleSearch],
  )

  const handlePerPageChange = useCallback(
    (newPerPage: number) => {
      setPerPage(newPerPage)
      setPage(1)
      setIsInternallyLoading(true)
      handleSearch()
    },
    [setPerPage, setPage, setIsInternallyLoading, handleSearch],
  )

  const handleForceRefetch = useCallback(() => {
    setIsInternallyLoading(true)
    handleSearch()
  }, [setIsInternallyLoading, handleSearch])

  return {
    page,
    perPage,
    totalPages,
    items,
    isLoading: isInternallyLoading,
    handlePageChange,
    handlePerPageChange,
    handleForceRefetch,
  }
}
