import type { Trackers } from "@prisma/client"

const getTrackerLabel = (tracker: Trackers) => {
  switch (tracker) {
    case "MANGADEX":
      return "MangaDex"
    case "ANILIST":
      return "AniList"
    case "MYANIMELIST":
      return "MyAnimeList"
  }
}

const getTrackerUrl = (tracker: { tracker: Trackers; externalId: string }) => {
  switch (tracker.tracker) {
    case "MANGADEX":
      return `https://mangadex.org/title/${tracker.externalId}`
    case "ANILIST":
      return `https://anilist.co/manga/${tracker.externalId}`
    case "MYANIMELIST":
      return `https://myanimelist.net/manga/${tracker.externalId}`
  }
}

export const TrackerUtils = {
  getTrackerLabel,
  getTrackerUrl,
}
