import type { InferNestedPaths } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import"

export class HttpError extends TRPCError {
  i18nKey: InferNestedPaths<IntlMessages["api"]>

  constructor(
    code: TRPC_ERROR_CODE_KEY,
    key: InferNestedPaths<IntlMessages["api"]>,
  ) {
    super({ code, message: key })

    this.i18nKey = key
  }
}
