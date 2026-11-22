import type { ReactNode } from "react"
import { type ReaderSettings, readerSettingsSchema } from "@taiyomoe/schemas/reader-settings"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DEFAULT_READER_SETTINGS } from "@/features/reader/lib/reader-settings"

const api = vi.hoisted(() => ({
  remote: { settings: null } as { settings: Partial<ReaderSettings> | null },
  saveReaderSettings: vi.fn<(settings: ReaderSettings, keepalive?: boolean) => Promise<object>>(
    () => Promise.resolve({}),
  ),
}))

vi.mock("@/features/reader/api/reader", () => ({
  readerSettingsQueryOptions: {
    queryKey: ["reader-settings"],
    queryFn: () => Promise.resolve(api.remote),
  },
  saveReaderSettings: api.saveReaderSettings,
}))

const STORAGE_KEY = "taiyo:reader-settings"
const loadHooks = () => import("@/features/reader/hooks/use-reader-settings")
const stored = () =>
  readerSettingsSchema.parse(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"))
const withQueryClient = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useReaderSettings", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
    api.saveReaderSettings.mockClear()
    api.remote = { settings: null }
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it("starts from the defaults when nothing is stored", async () => {
    const { useReaderSettings } = await loadHooks()
    const { result } = renderHook(() => useReaderSettings(false, false))

    expect(result.current.settings).toEqual(DEFAULT_READER_SETTINGS)
  })

  it("applies an update and persists it", async () => {
    const { useReaderSettings } = await loadHooks()
    const { result } = renderHook(() => useReaderSettings(false, false))

    act(() => {
      result.current.update({ direction: "rtl" })
    })

    expect(result.current.settings.direction).toBe("rtl")
    expect(stored().direction).toBe("rtl")
  })

  it("stores the mode of a long strip under longStripMode", async () => {
    const { useReaderSettings } = await loadHooks()
    const { result } = renderHook(() => useReaderSettings(true, false))

    act(() => {
      result.current.update({ mode: "double" })
    })

    expect(stored().longStripMode).toBe("double")
    expect(stored().mode).toBe(DEFAULT_READER_SETTINGS.mode)
    expect(result.current.settings.mode).toBe("double")
  })

  it("pushes the latest settings once after the debounce when signed in", async () => {
    vi.useFakeTimers()

    const { useReaderSettings } = await loadHooks()
    const { result } = renderHook(() => useReaderSettings(false, true))

    act(() => {
      result.current.update({ direction: "rtl" })
    })
    act(() => {
      vi.advanceTimersByTime(500)
      result.current.update({ fit: "width" })
    })
    act(() => {
      vi.advanceTimersByTime(799)
    })

    expect(api.saveReaderSettings).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(api.saveReaderSettings).toHaveBeenCalledTimes(1)
    expect(api.saveReaderSettings).toHaveBeenCalledWith(
      expect.objectContaining({ direction: "rtl", fit: "width" }),
      false,
    )
  })

  it("never pushes when signed out", async () => {
    vi.useFakeTimers()

    const { useReaderSettings } = await loadHooks()
    const { result } = renderHook(() => useReaderSettings(false, false))

    act(() => {
      result.current.update({ direction: "rtl" })
    })
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(api.saveReaderSettings).not.toHaveBeenCalled()
  })

  it("adopts the account settings when nothing was edited locally", async () => {
    api.remote = { settings: { direction: "rtl", fit: "width" } }

    const { useReaderSettings, useReaderSettingsSync } = await loadHooks()
    const wrapper = withQueryClient()

    renderHook(
      () => {
        useReaderSettingsSync(true)
      },
      { wrapper },
    )

    const { result } = renderHook(() => useReaderSettings(false, true))

    await waitFor(() => {
      expect(result.current.settings).toMatchObject({ direction: "rtl", fit: "width" })
    })
  })

  it("adopts the account settings again after the sync state is reset", async () => {
    api.remote = { settings: { direction: "rtl" } }

    const { resetReaderSettingsSync, useReaderSettings, useReaderSettingsSync } = await loadHooks()
    const { result } = renderHook(() => useReaderSettings(false, true))

    renderHook(
      () => {
        useReaderSettingsSync(true)
      },
      { wrapper: withQueryClient() },
    )

    await waitFor(() => {
      expect(result.current.settings.direction).toBe("rtl")
    })

    act(() => {
      result.current.update({ fit: "height" })
    })

    resetReaderSettingsSync()
    api.remote = { settings: { direction: "ltr", fit: "width" } }
    renderHook(
      () => {
        useReaderSettingsSync(true)
      },
      { wrapper: withQueryClient() },
    )

    await waitFor(() => {
      expect(result.current.settings).toMatchObject({ direction: "ltr", fit: "width" })
    })
  })
})
