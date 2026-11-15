import { useReaderHistory } from "@/features/reader/hooks/use-reader-history"

export function ReaderHistoryTracker(props: Parameters<typeof useReaderHistory>[0]) {
  useReaderHistory(props)

  return null
}
