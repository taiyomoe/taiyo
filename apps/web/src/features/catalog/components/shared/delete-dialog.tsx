import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { AlertTriangle, Info } from "@taiyomoe/ui/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@taiyomoe/ui/components/ui/alert-dialog"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { range } from "remeda"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { m } from "@/paraglide/messages"

export type DeleteConsequence = {
  icon: (props: IconProps) => ReactElement
  text: string
}

type DeleteRequest = {
  title: ReactNode
  description: string
  consequences: readonly DeleteConsequence[] | undefined
  loadError: string | null
  restorable: boolean
  blockedReason?: string | undefined
  confirmLabel: string
}

const styles = stylex.create({
  body: {
    gap: "1rem",
    paddingInline: "1.5rem",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "1.5rem",
  },
  heading: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  list: {
    margin: 0,
    padding: 0,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    listStyle: "none",
    overflow: "hidden",
  },
  item: {
    gap: "0.75rem",
    paddingBlock: "0.625rem",
    paddingInline: "0.875rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
    lineHeight: 1.4,
    borderTopColor: colors.border,
    borderTopStyle: { default: "solid", ":first-child": "none" },
    borderTopWidth: 1,
  },
  icon: {
    color: colors.mutedForeground,
    flexShrink: 0,
    height: "1rem",
    width: "1rem",
  },
  skeleton: {
    height: "0.875rem",
    width: "70%",
  },
})

export function DeleteDialog({
  request,
  pending,
  error,
  onConfirm,
  onClose,
}: {
  request: DeleteRequest | null
  pending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}) {
  const consequences = request?.consequences
  const blocked = request?.blockedReason !== undefined

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={request !== null}
    >
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{request?.title}</AlertDialogTitle>
          <AlertDialogDescription>{request?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div sx={styles.body}>
          {blocked ? (
            <Alert variant="warning">
              <AlertTriangle />
              <AlertTitle>{m.catalog_delete_blocked()}</AlertTitle>
              <AlertDescription>{request.blockedReason}</AlertDescription>
            </Alert>
          ) : (
            <>
              <h3 sx={styles.heading}>{m.catalog_delete_consequences()}</h3>
              <ErrorAlert message={request?.loadError ?? null} />
              {(request?.loadError ?? null) === null ? (
                <ul aria-busy={consequences === undefined} sx={styles.list}>
                  {consequences === undefined
                    ? range(0, 4).map((index) => (
                        <li key={index} sx={styles.item}>
                          <Skeleton sx={styles.skeleton} />
                        </li>
                      ))
                    : consequences.map(({ icon: Icon, text }) => (
                        <li key={text} sx={styles.item}>
                          <Icon {...stylex.props(styles.icon)} />
                          {text}
                        </li>
                      ))}
                </ul>
              ) : null}
              <Alert variant={request?.restorable === true ? "info" : "warning"}>
                {request?.restorable === true ? <Info /> : <AlertTriangle />}
                <AlertTitle>
                  {request?.restorable === true
                    ? m.catalog_delete_restorable()
                    : m.catalog_delete_permanent()}
                </AlertTitle>
              </Alert>
            </>
          )}
          <ErrorAlert message={error} />
        </div>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>{m.cancel()}</AlertDialogClose>
          <Button
            disabled={
              blocked || consequences === undefined || (request?.loadError ?? null) !== null
            }
            loading={pending}
            onClick={onConfirm}
            variant="destructive"
          >
            {request?.confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  )
}
