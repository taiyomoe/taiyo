import { Hono } from "hono"
import { createBannersHandler } from "../handlers/create-banners-handler"
import { createChapterHandler } from "../handlers/create-chapter-handler"
import { createCoversHandler } from "../handlers/create-covers-handler"
import { createMediaHandler } from "../handlers/create-media-handler"
import { createMediaSuggestionHandler } from "../handlers/create-media-suggestion-handler"
import { deleteMediaHandler } from "../handlers/delete-media-handler"
import { deleteMediasHandler } from "../handlers/delete-medias-handler"
import { flagMediaHandler } from "../handlers/flag-media-handler"
import { getMangaDexPlanHandler } from "../handlers/get-mangadex-plan-handler"
import { getMediaDeletionImpactHandler } from "../handlers/get-media-deletion-impact-handler"
import { getMediaEditHandler } from "../handlers/get-media-edit-handler"
import { getMediaHandler } from "../handlers/get-media-handler"
import { getMediasDeletionImpactHandler } from "../handlers/get-medias-deletion-impact-handler"
import { linkMediaStaffHandler } from "../handlers/link-media-staff-handler"
import { listBannersHandler } from "../handlers/list-banners-handler"
import { listChapterFacetsHandler } from "../handlers/list-chapter-facets-handler"
import { listChapterNumbersHandler } from "../handlers/list-chapter-numbers-handler"
import { listChaptersHandler } from "../handlers/list-chapters-handler"
import { listCoversHandler } from "../handlers/list-covers-handler"
import { listFeaturedMediasHandler } from "../handlers/list-featured-medias-handler"
import { listManagedFeaturedMediasHandler } from "../handlers/list-managed-featured-medias-handler"
import { listManagedMediasHandler } from "../handlers/list-managed-medias-handler"
import { listMangaDexSyncsHandler } from "../handlers/list-mangadex-syncs-handler"
import { listMediaStaffsHandler } from "../handlers/list-media-staffs-handler"
import { listShowcaseMediasHandler } from "../handlers/list-showcase-medias-handler"
import { markMediaReadHandler } from "../handlers/mark-media-read-handler"
import { mergeMediasHandler } from "../handlers/merge-medias-handler"
import { reindexMediaHandler } from "../handlers/reindex-media-handler"
import { restoreMediaHandler } from "../handlers/restore-media-handler"
import { restoreMediasHandler } from "../handlers/restore-medias-handler"
import { searchMediasHandler } from "../handlers/search-medias-handler"
import { setFeaturedMediasHandler } from "../handlers/set-featured-medias-handler"
import { startMangaDexSyncHandler } from "../handlers/start-mangadex-sync-handler"
import { unlinkMediaStaffHandler } from "../handlers/unlink-media-staff-handler"
import { updateMediaHandler } from "../handlers/update-media-handler"
import { updateMediasHandler } from "../handlers/update-medias-handler"

export const mediasRouter = new Hono()
  .route("/", createMediaHandler)
  .route("/", listManagedMediasHandler)
  .route("/", updateMediasHandler)
  .route("/", deleteMediasHandler)
  .route("/", restoreMediasHandler)
  .route("/", getMediasDeletionImpactHandler)
  .route("/", listFeaturedMediasHandler)
  .route("/", listManagedFeaturedMediasHandler)
  .route("/", setFeaturedMediasHandler)
  .route("/", listShowcaseMediasHandler)
  .route("/", getMediaHandler)
  .route("/", searchMediasHandler)
  .route("/", updateMediaHandler)
  .route("/", getMediaEditHandler)
  .route("/", createMediaSuggestionHandler)
  .route("/", deleteMediaHandler)
  .route("/", getMediaDeletionImpactHandler)
  .route("/", restoreMediaHandler)
  .route("/", mergeMediasHandler)
  .route("/", flagMediaHandler)
  .route("/", reindexMediaHandler)
  .route("/", listCoversHandler)
  .route("/", createCoversHandler)
  .route("/", listBannersHandler)
  .route("/", createBannersHandler)
  .route("/", listChapterFacetsHandler)
  .route("/", listChaptersHandler)
  .route("/", listChapterNumbersHandler)
  .route("/", markMediaReadHandler)
  .route("/", createChapterHandler)
  .route("/", listMediaStaffsHandler)
  .route("/", linkMediaStaffHandler)
  .route("/", unlinkMediaStaffHandler)
  .route("/", getMangaDexPlanHandler)
  .route("/", startMangaDexSyncHandler)
  .route("/", listMangaDexSyncsHandler)
