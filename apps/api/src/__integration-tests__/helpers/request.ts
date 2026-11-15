import type { Hono } from "hono"

type ApiResponse<TData = unknown> =
  | { success: true; data: TData; meta?: Record<string, unknown> }
  | { success: false; code: string; message: string; details?: unknown }

export type ApiResult<TData = unknown> = {
  status: number
  body: ApiResponse<TData>
}

const isApiResponse = <TData>(value: unknown): value is ApiResponse<TData> =>
  typeof value === "object" && value !== null && "success" in value

type RequestOptions = {
  method?: string
  headers?: Record<string, string>
  json?: unknown
  form?: FormData
}

export const api = async <TData = unknown>(
  app: Hono,
  path: string,
  { method = "GET", headers, json, form }: RequestOptions = {},
): Promise<ApiResult<TData>> => {
  const finalHeaders = new Headers(headers)
  let finalBody: FormData | string | null = null

  if (json !== undefined) {
    finalBody = JSON.stringify(json)
    finalHeaders.set("content-type", "application/json")
  } else if (form !== undefined) {
    finalBody = form
  }

  const res = await app.request(path, { method, headers: finalHeaders, body: finalBody })
  const parsed: unknown = await res.json()

  if (!isApiResponse<TData>(parsed)) {
    throw new Error(`Expected an API response envelope: ${JSON.stringify(parsed)}`)
  }

  return { status: res.status, body: parsed }
}
