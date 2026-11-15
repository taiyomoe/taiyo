import type { Group } from "@/features/groups/api/groups"
import type { ListDetail } from "@/features/lists/api/lists"
import type { Media } from "@/features/media/api/medias"
import type { chapterOgCard } from "@/features/og/lib/og-cards"
import type { ReaderChapter } from "@/features/reader/api/reader"
import type { UserProfile } from "@/features/users/api/profile"

type Chapter = Parameters<typeof chapterOgCard>[0]["chapter"]

const ID = "00000000-0000-4000-8000-000000000000"
const DATE = "2024-03-01T00:00:00.000Z"

export const LONG_TITLE =
  "The Extraordinarily Long and Winding Chronicle of the Reincarnated Swordmaster Who Swore He Would Never Pick Up a Blade Again Until the Demon Lord Burned Down His Bakery"

export const UNBROKEN =
  "Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

export const LONG_TEXT = Array.from(
  { length: 30 },
  () => "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
).join(" ")

export const media = (images: string, overrides: Partial<Media> = {}): Media => ({
  id: ID,
  createdAt: DATE,
  updatedAt: DATE,
  startDate: "2006-01-01T00:00:00.000Z",
  endDate: null,
  synopsis: { en: "A boy who wants to become the greatest general under the heavens." },
  contentRating: "NORMAL",
  type: "MANGA",
  status: "RELEASING",
  source: "ORIGINAL",
  demography: "SEINEN",
  countryOfOrigin: "JAPAN",
  flag: "OK",
  tags: [
    { key: "ACTION", isSpoiler: false },
    { key: "DRAMA", isSpoiler: false },
    { key: "HISTORICAL", isSpoiler: false },
    { key: "MILITARY", isSpoiler: false },
    { key: "TRAGEDY", isSpoiler: true },
    { key: "MARTIAL_ARTS", isSpoiler: false },
    { key: "SURVIVAL", isSpoiler: false },
  ],
  links: {},
  creatorId: ID,
  titles: [
    { id: ID, title: "Kingdom", language: "en", priority: 1, isAcronym: false, isMainTitle: true },
    {
      id: ID,
      title: "キングダム",
      language: "ja",
      priority: 1,
      isAcronym: false,
      isMainTitle: false,
    },
  ],
  covers: [
    {
      id: ID,
      url: `${images}/cover.jpg`,
      volume: null,
      language: "ja",
      contentRating: "NORMAL",
      isMainCover: true,
    },
  ],
  banners: [],
  staffs: [],
  ...overrides,
})

export const titled = (images: string, title: string, overrides: Partial<Media> = {}) =>
  media(images, {
    titles: [{ id: ID, title, language: "en", priority: 1, isAcronym: false, isMainTitle: true }],
    ...overrides,
  })

export const chapter = (overrides: Partial<Chapter> = {}): Chapter => ({
  id: ID,
  mediaId: ID,
  title: "The Nameless Boy",
  number: 1,
  volume: "1",
  language: "pt_br",
  contentRating: "NORMAL",
  flag: "OK",
  status: "PUBLISHED",
  pages: [],
  publishAt: null,
  externalUrl: null,
  isExternal: false,
  createdAt: DATE,
  updatedAt: DATE,
  ...overrides,
})

export const readerEntry = (overrides: Partial<ReaderChapter> = {}): ReaderChapter => ({
  id: ID,
  number: 1,
  volume: "1",
  title: "The Nameless Boy",
  language: "pt_br",
  isExternal: false,
  pageCount: 54,
  groups: [{ id: ID, name: "Kyodai Scans" }],
  ...overrides,
})

export const user = (images: string, overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: ID,
  username: "aaliyah.bosco34",
  displayUsername: "Aaliyah.Bosco34",
  image: `${images}/avatar.jpg`,
  nameEffect: null,
  avatarBorder: null,
  title: null,
  role: "USER",
  createdAt: DATE,
  bannerUrl: `${images}/banner.jpg`,
  about: { en: "Reading **everything** with ||spoilers hidden||. Shounen first, always." },
  city: null,
  country: null,
  gender: "NOT_SPECIFIED",
  birthDate: null,
  points: 1197,
  xp: 0,
  followerCount: 128,
  followingCount: 10,
  followingHidden: false,
  uploadCount: 45,
  commentCount: 3,
  listCount: 4,
  viewerFollows: null,
  followsViewer: null,
  groups: [],
  ...overrides,
})

export const group = (images: string, overrides: Partial<Group> = {}): Group => ({
  id: ID,
  name: "God Hand Scans",
  description: "We translate seinen classics into Brazilian Portuguese, one chapter a week.",
  logo: "groups/logo.jpg",
  logoUrl: `${images}/logo.jpg`,
  banner: "",
  website: "",
  discord: "",
  x: "",
  facebook: "",
  instagram: "",
  telegram: "",
  youtube: "",
  email: "",
  owned: false,
  chapterCount: 43,
  mediaCount: 2,
  memberCount: 5,
  followerCount: 1,
  commentCount: 0,
  languages: ["pt_br", "en"],
  lastUploadAt: DATE,
  createdAt: DATE,
  updatedAt: DATE,
  ...overrides,
})

export const list = (
  images: string,
  items: number,
  overrides: Partial<ListDetail> = {},
): ListDetail => ({
  id: ID,
  name: "Best shounen of the decade",
  description: "Everything I would hand to a friend who has never read manga.",
  visibility: "PUBLIC",
  itemCount: items,
  upvoteCount: 12,
  viewerVoted: false,
  createdAt: DATE,
  updatedAt: DATE,
  owner: {
    id: ID,
    username: "aaliyah.bosco34",
    displayUsername: "Aaliyah.Bosco34",
    image: `${images}/avatar.jpg`,
    nameEffect: null,
    avatarBorder: null,
  },
  coverUrls: [],
  hiddenItemCount: 0,
  items: Array.from({ length: Math.min(items, 50) }, (_, index) => ({
    mediaId: ID,
    position: index,
    addedAt: DATE,
    title: `Title ${index}`,
    coverUrl: `${images}/cover-${index % 5}.jpg`,
    type: "MANGA" as const,
    status: "RELEASING" as const,
    contentRating: "NORMAL" as const,
  })),
  ...overrides,
})
