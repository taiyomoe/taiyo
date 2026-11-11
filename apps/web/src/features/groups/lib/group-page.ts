export const GROUP_TABS = ["info", "chapters", "titles", "members", "comments", "stats"] as const

export type GroupTab = (typeof GROUP_TABS)[number]

export const GROUP_CHAPTER_ORDERS = ["latest", "oldest"] as const

export type GroupChapterOrder = (typeof GROUP_CHAPTER_ORDERS)[number]

export const GROUP_MEDIA_SORTS = ["recent", "chapters", "title"] as const

export type GroupMediaSort = (typeof GROUP_MEDIA_SORTS)[number]

export const GROUP_MEDIAS_PER_PAGE = 10

export const GROUP_TITLES_PER_PAGE = 24

export const GROUP_LATEST_RELEASES = 6

export const GROUP_TITLE_OPTIONS = 100
