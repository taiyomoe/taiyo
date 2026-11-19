import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { AlertTriangle, Link as LinkIcon } from "@taiyomoe/ui/components/icons"
import { Alert, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { GroupRequestItem } from "@/features/groups/lib/group-requests"
import { Pill } from "@/components/badges/pill"
import { RichText } from "@/components/rich-text/rich-text"
import { parseRichText } from "@/components/rich-text/rich-text-document"
import { TimeAgo } from "@/components/time/time-ago"
import { renderWithName } from "@/components/user-name/with-name"
import {
  DetailDialog,
  DetailQuote,
  DetailSection,
  ProofLinkList,
} from "@/features/groups/components/detail-dialog"
import {
  REQUEST_STATUS_OPTIONS,
  REQUEST_TYPE_OPTIONS,
  requestStatusVariant,
  requestTypeLabel,
} from "@/features/groups/lib/group-request-options"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  proof: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.8125rem",
    minWidth: 0,
  },
  proofLink: {
    gap: "0.375rem",
    overflow: "hidden",
    textDecoration: { default: "none", ":hover": "underline" },
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    minWidth: 0,
  },
  proofHost: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  proofIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  more: {
    font: "inherit",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: { default: colors.mutedForeground, ":hover": colors.foreground },
    cursor: "pointer",
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
  },
  none: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontStyle: "italic",
    lineHeight: 1.35,
    whiteSpace: "normal",
  },
  pills: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
})
const hostOf = (link: string) => {
  try {
    return new URL(link).host.replace(/^www\./, "")
  } catch {
    return link
  }
}

export function RequestStatusPill({ status }: { status: GroupRequestItem["status"] }) {
  return <Pill variant={requestStatusVariant(status)}>{REQUEST_STATUS_OPTIONS.label(status)}</Pill>
}

export function RequestTypePill({ type }: { type: GroupRequestItem["type"] }) {
  return <Pill icon={REQUEST_TYPE_OPTIONS.icon(type)}>{requestTypeLabel(type)}</Pill>
}

/** Why an admin cannot approve the request as things stand. */
export function RequestBlockerPill({ blocker }: { blocker: GroupRequestItem["blocker"] }) {
  if (blocker === null) {
    return null
  }

  return (
    <Pill
      icon={AlertTriangle}
      title={blocker === "OWNED" ? m.review_already_owned() : m.review_name_taken()}
      variant="warning"
    >
      {blocker === "OWNED" ? m.group_requests_owned() : m.group_requests_name_taken()}
    </Pill>
  )
}

/** The first proof link by its site, and how many more the request gives. */
export function ProofSummary({ links, onMore }: { links: readonly string[]; onMore: () => void }) {
  const [first] = links

  if (first === undefined) {
    return <span sx={styles.none}>{m.group_requests_no_proof()}</span>
  }

  return (
    <span sx={styles.proof}>
      <a
        href={first}
        rel="noopener noreferrer nofollow"
        sx={styles.proofLink}
        target="_blank"
        title={first}
      >
        <LinkIcon size={14} {...stylex.props(styles.proofIcon)} />
        <span sx={styles.proofHost}>{hostOf(first)}</span>
      </a>
      {links.length > 1 ? (
        <button
          onClick={onMore}
          sx={styles.more}
          title={m.group_requests_all_proof()}
          type="button"
        >
          {m.group_more_count({ count: links.length - 1 })}
        </button>
      ) : null}
    </span>
  )
}

/** The request in full: who sent it, the message, the description and every proof link. */
export function RequestDetailsDialog({
  request,
  footer,
  onClose,
}: {
  request: GroupRequestItem | null
  footer?: ReactNode
  onClose: () => void
}) {
  return (
    <DetailDialog
      footer={footer}
      meta={
        request === null ? null : (
          <>
            {request.requester === null
              ? requestTypeLabel(request.type)
              : renderWithName(
                  request.type === "claims"
                    ? m.group_requests_claimed_by
                    : m.group_requests_asked_by,
                  request.requester,
                )}
            <span aria-hidden>·</span>
            <TimeAgo date={request.createdAt} length="long" />
          </>
        )
      }
      onClose={onClose}
      open={request !== null}
      title={request?.name}
    >
      {request === null ? null : (
        <>
          {request.status === "PENDING" && request.blocker !== null ? (
            <Alert variant="warning">
              <AlertTriangle />
              <AlertTitle>
                {request.blocker === "OWNED" ? m.review_already_owned() : m.review_name_taken()}
              </AlertTitle>
            </Alert>
          ) : null}
          {request.status === "PENDING" ? null : (
            <DetailSection title={m.group_requests_column_status()}>
              <div sx={styles.pills}>
                <RequestStatusPill status={request.status} />
              </div>
              {request.reviewerNote === null ? null : (
                <DetailQuote>{request.reviewerNote}</DetailQuote>
              )}
            </DetailSection>
          )}
          {request.description === null ? null : (
            <DetailSection title={m.request_group_about()}>
              <RichText collapsible document={parseRichText(request.description)} size="sm" />
            </DetailSection>
          )}
          <DetailSection title={m.claim_message_label()}>
            <DetailQuote>{request.message ?? m.group_requests_no_message()}</DetailQuote>
          </DetailSection>
          <DetailSection title={m.group_requests_proof_count({ count: request.proofLinks.length })}>
            {request.proofLinks.length === 0 ? (
              <span sx={styles.none}>{m.group_requests_no_proof()}</span>
            ) : (
              <ProofLinkList links={request.proofLinks} />
            )}
          </DetailSection>
        </>
      )}
    </DetailDialog>
  )
}
