import type { QueryClient } from "@tanstack/react-query"
import type { MediaOption } from "@/features/uploads/components/upload/media-field"
import { getRichTextParagraphs, parseRichText } from "@/components/rich-text/rich-text-document"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { getMainTitle, getSynopsis } from "@/features/media/lib/media-labels"

export const loadMediaOption = async (queryClient: QueryClient, mediaId: string | undefined) =>
  mediaId === undefined
    ? null
    : queryClient
        .query(mediaQueryOptions(mediaId))
        .then(
          (data) =>
            ({
              id: data.id,
              title: getMainTitle(data.titles) ?? "",
              coverUrl: data.covers.find((cover) => cover.isMainCover)?.url ?? null,
              synopsis: (
                getRichTextParagraphs(parseRichText(getSynopsis(data.synopsis)))[0] ?? ""
              ).replace(/\s+/g, " "),
            }) satisfies MediaOption,
        )
        .catch(() => null)
