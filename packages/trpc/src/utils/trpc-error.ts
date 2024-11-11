import { TRPCError } from "@trpc/server"
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import"
import type { createTranslator } from "use-intl/core"

export class HttpError extends TRPCError {
  i18nKey: Parameters<ReturnType<typeof createTranslator<"api">>>[0]

  constructor(
    code: TRPC_ERROR_CODE_KEY,
    key: Parameters<ReturnType<typeof createTranslator<"api">>>[0],
  ) {
    super({ code, message: key })

    this.i18nKey = key
  }
}
