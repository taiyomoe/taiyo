import type { AuditActor } from "evlog"

declare module "evlog" {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface AuditActor {
    impersonating?: string
  }
}

export const anonymousActor: AuditActor = { type: "user", id: "anonymous" }

export const systemActor = (id: string): AuditActor => ({ type: "system", id })

export const userActor = (
  { id, displayUsername }: { id: string; displayUsername?: string | null | undefined },
  session: object = {},
): AuditActor => {
  if (
    "impersonatedBy" in session &&
    typeof session.impersonatedBy === "string" &&
    session.impersonatedBy !== ""
  ) {
    return { type: "user", id: session.impersonatedBy, impersonating: id }
  }

  return displayUsername === undefined || displayUsername === null || displayUsername === ""
    ? { type: "user", id }
    : { type: "user", id, displayName: displayUsername }
}
