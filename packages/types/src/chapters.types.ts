import { Prisma } from "@prisma/client"
import type {
  ContentRating,
  Flag,
  Languages,
  Media,
  MediaChapter,
  MediaChapterComment,
  MediaCover,
  MediaTitle,
  Scan,
  User,
} from "@prisma/client"

export type MediaChapterPage = { id: string }
export type MediaCommentAttachement = { id: string; extension: "png" | "gif" }

export type RawLatestRelease = {
  id: MediaChapter["id"]
  createdAt: MediaChapter["createdAt"]
  number: MediaChapter["number"]
  volume: MediaChapter["volume"]
  title: MediaChapter["title"]
  media: {
    id: Media["id"]
    covers: { id: MediaCover["id"] }[]
    titles: Pick<
      MediaTitle,
      "title" | "language" | "priority" | "isAcronym" | "isMainTitle"
    >[]
  }
  uploader: Pick<User, "id" | "name">
  scans: Pick<Scan, "id" | "name">[]
}

export type LatestRelease = Omit<RawLatestRelease, "media"> & {
  media: Omit<RawLatestRelease["media"], "titles" | "covers"> & {
    coverId: string
    mainTitle: string
  }
}

export type RawLatestReleaseGroupedChapter = Pick<
  MediaChapter,
  "id" | "createdAt" | "number" | "volume" | "title" | "mediaId" | "uploaderId"
> & {
  scanIds: string[]
  uploadedCount: number
  totalCount: number
  rank: number
}
export type RawLatestReleaseGrouped = {
  id: Media["id"]
  synopsis: Media["synopsis"]
  hasMoreChapters: boolean
  coverId: MediaCover["id"]
  titles: {
    title: MediaTitle["title"]
    language: MediaTitle["language"]
    priority: MediaTitle["priority"]
    isAcronym: MediaTitle["isAcronym"]
    isMainTitle: MediaTitle["isMainTitle"]
  }[]
  chapters: {
    id: MediaChapter["id"]
    createdAt: MediaChapter["createdAt"]
    number: MediaChapter["number"]
    volume: MediaChapter["volume"]
    title: MediaChapter["title"]
    completed: boolean | null
    uploader: {
      id: User["id"]
      name: User["name"]
    }
    scans: {
      id: Scan["id"]
      name: Scan["name"]
    }[]
  }[]
}

export type LatestReleaseGrouped = Omit<RawLatestReleaseGrouped, "titles"> & {
  mainTitle: string
}

export type MediaChapterLimitedBase = {
  id: MediaChapter["id"]
  number: MediaChapter["number"]
  title: MediaChapter["title"]
}

export type MediaChapterLimited = {
  id: MediaChapter["id"]
  title: MediaChapter["title"]
  number: MediaChapter["number"]
  volume: MediaChapter["volume"]
  pages: MediaChapter["pages"]
  previousChapter: MediaChapterLimitedBase | null
  nextChapter: MediaChapterLimitedBase | null
  // ----- RELATIONS
  uploader: {
    id: User["id"]
    name: User["name"]
  }
  media: {
    id: Media["id"]
    type: Media["type"]
    title: MediaTitle["title"]
    chapters: MediaChapterLimitedBase[]
  }
  scans: {
    id: Scan["id"]
    name: Scan["name"]
  }[]
  comments: MediaChapterComment[]
}

export type MediaChapterNavigation = {
  previousPage: number | null
  currentPage: number
  nextPage: number | null
}

export type ReaderImage = { number: number; blobUrl: string }
export type ReaderSettings = {
  sidebar: {
    state: "show" | "hide"
    side: "left" | "right"
    openMode: "button" | "hover"
  }
  navbarMode: "fixed" | "sticky" | "hover"
  page: {
    mode: "single" | "longstrip"
    overlay: "show" | "hide"
    height: "fit" | "full"
    width: "fit" | "full"
    brightness: number
  }
}

export type MediaChaptersUploadersStats = {
  date: Date
  chaptersCount: number
  userName: string
}[]

const mediaChapterWithRelations =
  Prisma.validator<Prisma.MediaChapterDefaultArgs>()({
    include: {
      scans: true,
    },
  })
export type MediaChapterWithRelations = Prisma.MediaChapterGetPayload<
  typeof mediaChapterWithRelations
>

export type MediaChapterWithScans = MediaChapter & { scanIds: string[] }

export type ChaptersListItem = Omit<
  MediaChapter,
  "pages" | "mediaId" | "uploaderId" | "deleterId"
> & {
  media: { id: string; mainTitle: string }
  uploader: Pick<User, "id" | "name" | "image">
  deleter: Pick<User, "id" | "name" | "image"> | null
  scans: Pick<Scan, "id" | "name">[]
}

export type ChaptersListFilters = {
  numbers: number[]
  notNumbers: number[]
  volumes: number[]
  notVolumes: number[]
  languages: Languages[]
  notLanguages: Languages[]
  contentRatings: ContentRating[]
  notContentRatings: ContentRating[]
  flags: Flag[]
  notFlags: Flag[]
  uploaderIds: string[]
  notUploaderIds: string[]
  mediaIds: string[]
  notMediaIds: string[]
  scanIds: string[]
  notScanIds: string[]
  deleterIds: string[]
  notDeleterIds: string[]
  includeDeleted: boolean
  page: number
  perPage: number
}
