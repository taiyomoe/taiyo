import { DEFAULT_CHAPTERS_LIST_PER_PAGE } from "@taiyomoe/constants"
import type { ContentRating, Flag, Languages } from "@taiyomoe/db"
import type { ChaptersListFilters } from "@taiyomoe/types"
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
    {
      numbers,
      notNumbers,
      volumes,
      notVolumes,
      languages,
      notLanguages,
      contentRatings,
      notContentRatings,
      flags,
      notFlags,
      uploaderIds,
      notUploaderIds,
      mediaIds,
      notMediaIds,
      scanIds,
      notScanIds,
      deleterIds,
      notDeleterIds,
      includeDeleted,
      page,
      perPage,
    },
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
      setPage(null)
      setIsInternallyLoading(true)
      handleSearch()
    },
    [setPerPage, setPage, setIsInternallyLoading, handleSearch],
  )

  const handleFilterChange =
    <TFilter extends keyof ChaptersListFilters>(key: TFilter) =>
    (newValue: ChaptersListFilters[TFilter]) => {
      console.log("Filter changed", key, newValue)

      setPage(null)
      setIsInternallyLoading(true)

      switch (key) {
        case "numbers":
          setNumbers(newValue as number[])
          break
        case "notNumbers":
          setNotNumbers(newValue as number[])
          break
        case "volumes":
          setVolumes(newValue as number[])
          break
        case "notVolumes":
          setNotVolumes(newValue as number[])
          break
        case "languages":
          setLanguages(newValue as Languages[])
          break
        case "notLanguages":
          setNotLanguages(newValue as Languages[])
          break
        case "contentRatings":
          setContentRatings(newValue as ContentRating[])
          break
        case "notContentRatings":
          setNotContentRatings(newValue as ContentRating[])
          break
        case "flags":
          setFlags(newValue as Flag[])
          break
        case "notFlags":
          setNotFlags(newValue as Flag[])
          break
        case "uploaderIds":
          setUploaderIds(newValue as string[])
          break
        case "notUploaderIds":
          setNotUploaderIds(newValue as string[])
          break
        case "mediaIds":
          setMediaIds(newValue as string[])
          break
        case "notMediaIds":
          setNotMediaIds(newValue as string[])
          break
        case "scanIds":
          setScanIds(newValue as string[])
          break
        case "notScanIds":
          setNotScanIds(newValue as string[])
          break
        case "deleterIds":
          setDeleterIds(newValue as string[])
          break
        case "notDeleterIds":
          setNotDeleterIds(newValue as string[])
          break
        case "includeDeleted":
          setIncludeDeleted(newValue as boolean)
          break
      }

      handleSearch()
    }

  return {
    numbers,
    notNumbers,
    volumes,
    notVolumes,
    languages,
    notLanguages,
    contentRatings,
    notContentRatings,
    flags,
    notFlags,
    uploaderIds,
    notUploaderIds,
    mediaIds,
    notMediaIds,
    scanIds,
    notScanIds,
    deleterIds,
    notDeleterIds,
    includeDeleted,
    page,
    perPage,
    totalPages,
    items,
    isLoading: isInternallyLoading,
    handlePageChange,
    handlePerPageChange,
    handleFilterChange,
  }
}
