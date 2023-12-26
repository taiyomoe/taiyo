import type {
  ContentRating,
  Languages,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaGenres,
  MediaStatus,
  MediaType,
  Trackers,
} from "@prisma/client"
import type { Manga } from "mangadex-full-api"

import type { TAG_KEYS } from "~/lib/i18n/tags"

const getContentRating = (manga: Manga): ContentRating => {
  switch (manga.contentRating) {
    case "safe":
      return "NORMAL"
    case "suggestive":
      return "SUGGESTIVE"
    default:
      return "NSFW"
  }
}

const getType = (manga: Manga): MediaType => {
  switch (manga.originalLanguage as Languages) {
    case "ko":
    case "en":
      return "MANHWA"
    case "zh":
    case "zh_hk":
      return "MANHUA"
    default:
      return "MANGA"
  }
}

const getStatus = (manga: Manga): MediaStatus => {
  switch (manga.status) {
    case "ongoing":
      return "RELEASING"
    case "hiatus":
      return "HIATUS"
    case "completed":
      return "FINISHED"
    case "cancelled":
      return "CANCELLED"
    default:
      return "CANCELLED"
  }
}

const getDemography = (manga: Manga): MediaDemography => {
  switch (manga.publicationDemographic) {
    case "shounen":
      return "SHOUNEN"
    case "shoujo":
      return "SHOUJO"
    case "josei":
      return "JOSEI"
    case "seinen":
      return "SEINEN"
    default:
      return "SHOUNEN"
  }
}

const getCountryOfOrigin = (manga: Manga): MediaCountryOfOrigin => {
  switch (manga.originalLanguage as Languages) {
    case "ko":
      return "KOREA"
    case "zh":
    case "zh_hk":
      return "CHINA"
    case "en":
      return "USA"
    case "fr":
      return "FRANCE"
    case "pt_br":
      return "BRAZIL"
    default:
      return "JAPAN"
  }
}

const getLanguage = (input: string): Languages => {
  switch (input) {
    case "ja-ro":
      return "ja_ro"
    case "ko-ro":
      return "ko_ro"
    case "zh-ro":
      return "zh_ro"
    case "zh-hk":
      return "zh_hk"
    case "pt":
      return "pt_pt"
    case "pt-br":
      return "pt_br"
    case "es-la":
      return "es_la"
    default:
      return input as Languages
  }
}

const getGenresAndTags = (manga: Manga) => {
  const genres: MediaGenres[] = []
  const tags: (typeof TAG_KEYS)[number][] = []
  let isOneShot = false

  // Tags list as of December 4th, 2023
  manga.tags.forEach((tag) => {
    switch (tag.name) {
      case "4-Koma":
        tags.push("FOUR_KOMA")
        break

      case "Action":
        genres.push("ACTION")
        break

      // case "Adaptation":
      case "Adventure":
        genres.push("ADVENTURE")
        break

      case "Aliens":
        tags.push("ALIENS")
        break

      case "Animals":
        tags.push("ANIMALS")
        break

      case "Anthology":
        tags.push("ANTHOLOGY")
        break

      // case "Award Winning":
      case "Boys' Love":
        tags.push("BOYS_LOVE")
        break

      case "Comedy":
        genres.push("COMEDY")
        break

      // case "Cooking":
      case "Crime":
        tags.push("CRIME")
        break

      case "Crossdressing":
        tags.push("CROSSDRESSING")
        break

      case "Delinquents":
        tags.push("DELINQUENTS")
        break

      case "Demons":
        tags.push("DEMONS")
        break

      // case "Doujinshi":
      case "Drama":
        genres.push("DRAMA")
        break

      // case "Fan Colored":
      case "Fantasy":
        genres.push("FANTASY")
        break

      case "Full Color":
        tags.push("FULL_COLOR")
        break

      case "Genderswap":
        tags.push("GENDER_BENDING")
        break

      case "Ghosts":
        tags.push("GHOST")
        break

      case "Girls' Love":
        tags.push("YURI")
        break

      case "Gore":
        tags.push("GORE")
        break

      case "Gyaru":
        tags.push("GYARU")
        break

      case "Harem":
        tags.push("FEMALE_HAREM")
        break

      case "Historical":
        tags.push("HISTORICAL")
        break

      case "Horror":
        genres.push("HORROR")
        break

      case "Incest":
        tags.push("INCEST")
        break

      case "Isekai":
        tags.push("ISEKAI")
        break

      // case "Loli":
      // case "Long Strip":
      case "Mafia":
        tags.push("MAFIA")
        break

      case "Magic":
        tags.push("MAGIC")
        break

      case "Magical Girls":
        genres.push("MAHOU_SHOUJO")
        break

      case "Martial Arts":
        tags.push("MARTIAL_ARTS")
        break

      case "Mecha":
        genres.push("MECHA")
        break

      case "Medical":
        tags.push("MEDICINE")
        break

      case "Military":
        tags.push("MILITARY")
        break

      case "Monster Girls":
        tags.push("MONSTER_GIRL")
        break

      // case "Monsters":
      case "Music":
        genres.push("MUSIC")
        break

      case "Mystery":
        genres.push("MYSTERY")
        break

      case "Ninja":
        tags.push("NINJA")
        break

      case "Office Workers":
        tags.push("WORK")
        break

      // case "Official Colored":
      case "Oneshot":
        isOneShot = true
      case "Philosophical":
        tags.push("PHILOSOPHY")
        break

      case "Police":
        tags.push("POLICE")
        break

      case "Post-Apocalyptic":
        tags.push("POSTAPOCALYPTIC")
        break

      case "Psychological":
        genres.push("PSYCHOLOGICAL")
        break

      case "Reincarnation":
        tags.push("REINCARNATION")
        break

      case "Reverse Harem":
        tags.push("MALE_HAREM")
        break

      case "Romance":
        genres.push("ROMANCE")
        break

      case "Samurai":
        tags.push("SAMURAI")
        break

      case "School Life":
        tags.push("SCHOOL")
        break

      case "Sci-Fi":
        genres.push("SCI_FI")
        break

      // case "Self-Published":
      // case "Sexual Violence":
      // case "Shota":
      case "Slice of Life":
        genres.push("SLICE_OF_LIFE")
        break

      case "Sports":
        genres.push("SPORTS")
        break

      case "Superhero":
        tags.push("SUPERHERO")
        break

      case "Supernatural":
        genres.push("SUPERNATURAL")
        break

      case "Survival":
        tags.push("SURVIVAL")
        break

      case "Thriller":
        genres.push("THRILLER")
        break

      case "Time Travel":
        tags.push("TIME_MANIPULATION")
        break

      // case "Traditional Games":
      case "Tragedy":
        tags.push("TRAGEDY")
        break

      case "Vampires":
        tags.push("VAMPIRE")
        break

      case "Video Games":
        tags.push("VIDEO_GAMES")
        break

      case "Villainess":
        tags.push("VILLAINESS")
        break

      case "Virtual Reality":
        tags.push("VIRTUAL_WORLD")
        break

      // case "Web Comic":
      case "Wuxia":
        tags.push("WUXIA")
        break

      case "Zombies":
        tags.push("ZOMBIE")
        break
    }
  })

  return { genres, tags, isOneShot }
}

const getTitles = (manga: Manga) => {
  const rawTitles = []
  const titles = []

  rawTitles.push({
    title:
      manga.localizedTitle.data[manga.localizedTitle.availableLocales[0]!]!,
    language: getLanguage(manga.localizedTitle.availableLocales[0]!),
    isMainTitle: true,
  })

  manga.localizedAltTitles.forEach((title) => {
    title.availableLocales.forEach((l) => {
      rawTitles.push({
        title: title.data[l]!,
        language: getLanguage(l),
        isMainTitle: false,
      })
    })
  })

  for (const title of rawTitles) {
    const titlesWithSameLanguage = rawTitles.filter(
      (t) => title.language === t.language,
    )
    const titleIndex = titlesWithSameLanguage.findIndex(
      (t) => t.title === title.title,
    )

    titles.push({
      ...title,
      priority: titlesWithSameLanguage.length - titleIndex,
    })
  }

  return titles as {
    title: string
    language: Languages
    isMainTitle: boolean
    priority: number
  }[]
}

const getTrackers = (manga: Manga) => {
  const trackers: { externalId: string; tracker: Trackers }[] = []

  trackers.push({
    externalId: manga.id,
    tracker: "MANGADEX",
  })

  if (manga.links.al) {
    trackers.push({
      externalId: manga.links.al.split("/").pop()!,
      tracker: "ANILIST",
    })
  }

  if (manga.links.mal) {
    trackers.push({
      externalId: manga.links.mal.split("/").pop()!,
      tracker: "MYANIMELIST",
    })
  }

  return trackers
}

export const MdUtils = {
  getContentRating,
  getType,
  getStatus,
  getDemography,
  getCountryOfOrigin,
  getLanguage,
  getGenresAndTags,
  getTitles,
  getTrackers,
}
