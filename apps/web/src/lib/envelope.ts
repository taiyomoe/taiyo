type SuccessBody = {
  success: true
  data: unknown
}

type FailureBody = {
  success: false
  code: string
  message: string
  details?: unknown
}

type EnvelopeResponse<TBody> = {
  status: number
  json: () => Promise<TBody>
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details: unknown

  constructor(body: FailureBody, status: number) {
    super(body.message)

    this.name = "ApiError"
    this.code = body.code
    this.status = status
    this.details = body.details
  }
}

function assertSuccessBody<TBody extends SuccessBody | FailureBody>(
  body: TBody,
  status: number,
): asserts body is Extract<TBody, { success: true }> {
  if (!body.success) {
    throw new ApiError(body, status)
  }
}

export const unwrapEnvelope = async <TBody extends SuccessBody | FailureBody>(
  response: EnvelopeResponse<TBody>,
): Promise<Extract<TBody, { success: true }>> => {
  const body = await response.json()

  assertSuccessBody(body, response.status)

  return body
}

export const unwrap = async <TBody extends SuccessBody | FailureBody>(
  response: EnvelopeResponse<TBody>,
): Promise<Extract<TBody, { success: true }>["data"]> => (await unwrapEnvelope(response)).data

export const ensureSuccess = async (
  response: EnvelopeResponse<SuccessBody | FailureBody>,
): Promise<void> => {
  await unwrapEnvelope(response)
}

export const getApiErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined
  }

  const candidate = error as { name?: unknown; code?: unknown }

  return candidate.name === "ApiError" && typeof candidate.code === "string"
    ? candidate.code
    : undefined
}
