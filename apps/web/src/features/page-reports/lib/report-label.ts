import type { PageReport } from "@/features/page-reports/api/page-reports"
import { m } from "@/paraglide/messages"

/** Where the reported page sits: its chapter and its position, once the page still exists. */
const reportPlace = (report: PageReport) =>
  [
    m.chapter_number({ number: report.chapter.number }),
    report.page === null
      ? m.page_reports_page_removed()
      : m.page_reports_page({ page: report.page }),
  ].join(" · ")

export const reportLabel = (report: PageReport) =>
  `${report.chapter.mediaTitle ?? m.media_untitled()} — ${reportPlace(report)}`
