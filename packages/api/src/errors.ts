import { TRPCError } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

class ApiError extends TRPCError {
  constructor(code: TRPC_ERROR_CODE_KEY, message: string, cause?: unknown) {
    super({
      code,
      cause,
      message,
    });
  }
}

export class InternalServerError extends ApiError {
  constructor(cause?: unknown) {
    super("INTERNAL_SERVER_ERROR", "SOMETHING_WRONG", cause);
  }
}

export class InvalidSessionError extends ApiError {
  constructor(cause?: unknown) {
    super("UNAUTHORIZED", "INVALID_SESSION", cause);
  }
}

export class InsuficientPermissionsError extends ApiError {
  constructor(cause?: unknown) {
    super("UNAUTHORIZED", "INSUFICIENT_PERMISSIONS", cause);
  }
}

export class NotFoundError extends ApiError {
  constructor(cause?: unknown) {
    super("NOT_FOUND", "NOT_FOUND", cause);
  }
}
