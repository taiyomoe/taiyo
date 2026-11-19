import { Hono } from "hono"
import { approveChapterHandler } from "../handlers/approve-chapter-handler"
import { approveChaptersHandler } from "../handlers/approve-chapters-handler"
import { closePageReportHandler } from "../handlers/close-page-report-handler"
import { closePageReportsHandler } from "../handlers/close-page-reports-handler"
import { createChapterUploadSessionHandler } from "../handlers/create-chapter-upload-session-handler"
import { createPageReportHandler } from "../handlers/create-page-report-handler"
import { deleteChapterHandler } from "../handlers/delete-chapter-handler"
import { deleteChaptersHandler } from "../handlers/delete-chapters-handler"
import { deletePageBookmarkHandler } from "../handlers/delete-page-bookmark-handler"
import { finalizeChapterUploadHandler } from "../handlers/finalize-chapter-upload-handler"
import { getChapterDeletionImpactHandler } from "../handlers/get-chapter-deletion-impact-handler"
import { getChapterHandler } from "../handlers/get-chapter-handler"
import { getChapterReaderHandler } from "../handlers/get-chapter-reader-handler"
import { getChapterUploadStatusHandler } from "../handlers/get-chapter-upload-status-handler"
import { getChaptersDeletionImpactHandler } from "../handlers/get-chapters-deletion-impact-handler"
import { linkChapterGroupHandler } from "../handlers/link-chapter-group-handler"
import { listChapterGroupsHandler } from "../handlers/list-chapter-groups-handler"
import { listChapterReviewQueueHandler } from "../handlers/list-chapter-review-queue-handler"
import { listLatestChaptersHandler } from "../handlers/list-latest-chapters-handler"
import { listLatestMediaUpdatesHandler } from "../handlers/list-latest-media-updates-handler"
import { listManagedChaptersHandler } from "../handlers/list-managed-chapters-handler"
import { listPageReportsHandler } from "../handlers/list-page-reports-handler"
import { listUpcomingChaptersHandler } from "../handlers/list-upcoming-chapters-handler"
import { markChapterReadHandler } from "../handlers/mark-chapter-read-handler"
import { markChapterUnreadHandler } from "../handlers/mark-chapter-unread-handler"
import { openChapterHandler } from "../handlers/open-chapter-handler"
import { putPageBookmarkHandler } from "../handlers/put-page-bookmark-handler"
import { rejectChapterHandler } from "../handlers/reject-chapter-handler"
import { rejectChaptersHandler } from "../handlers/reject-chapters-handler"
import { reorderChapterPagesHandler } from "../handlers/reorder-chapter-pages-handler"
import { unlinkChapterGroupHandler } from "../handlers/unlink-chapter-group-handler"
import { updateChapterHandler } from "../handlers/update-chapter-handler"
import { updateChapterHistoryHandler } from "../handlers/update-chapter-history-handler"
import { updateChaptersHandler } from "../handlers/update-chapters-handler"
import { withdrawChapterHandler } from "../handlers/withdraw-chapter-handler"
import { withdrawChaptersHandler } from "../handlers/withdraw-chapters-handler"

export const chaptersRouter = new Hono()
  .route("/", listManagedChaptersHandler)
  .route("/", updateChaptersHandler)
  .route("/", deleteChaptersHandler)
  .route("/", getChaptersDeletionImpactHandler)
  .route("/", listLatestChaptersHandler)
  .route("/", listLatestMediaUpdatesHandler)
  .route("/", listUpcomingChaptersHandler)
  .route("/", listChapterReviewQueueHandler)
  .route("/", listPageReportsHandler)
  .route("/", closePageReportsHandler)
  .route("/", closePageReportHandler)
  .route("/", getChapterHandler)
  .route("/", getChapterReaderHandler)
  .route("/", updateChapterHandler)
  .route("/", deleteChapterHandler)
  .route("/", getChapterDeletionImpactHandler)
  .route("/", listChapterGroupsHandler)
  .route("/", linkChapterGroupHandler)
  .route("/", unlinkChapterGroupHandler)
  .route("/", openChapterHandler)
  .route("/", updateChapterHistoryHandler)
  .route("/", markChapterReadHandler)
  .route("/", markChapterUnreadHandler)
  .route("/", putPageBookmarkHandler)
  .route("/", deletePageBookmarkHandler)
  .route("/", createPageReportHandler)
  .route("/", createChapterUploadSessionHandler)
  .route("/", finalizeChapterUploadHandler)
  .route("/", getChapterUploadStatusHandler)
  .route("/", approveChaptersHandler)
  .route("/", rejectChaptersHandler)
  .route("/", withdrawChaptersHandler)
  .route("/", approveChapterHandler)
  .route("/", rejectChapterHandler)
  .route("/", withdrawChapterHandler)
  .route("/", reorderChapterPagesHandler)
