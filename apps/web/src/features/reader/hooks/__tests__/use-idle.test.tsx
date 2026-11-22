import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useIdle } from "../use-idle"

const TIMEOUT = 1000
const EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"]
const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

describe("useIdle", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it("turns idle once the timeout elapses", () => {
    const { result } = renderHook(() => useIdle(TIMEOUT, true))

    expect(result.current).toBe(false)

    advance(TIMEOUT)

    expect(result.current).toBe(true)
  })

  it("restarts the timer on user activity", () => {
    const { result } = renderHook(() => useIdle(TIMEOUT, true))

    advance(TIMEOUT - 100)
    act(() => {
      window.dispatchEvent(new Event("pointermove"))
    })
    advance(TIMEOUT - 100)

    expect(result.current).toBe(false)

    advance(100)

    expect(result.current).toBe(true)
  })

  it("wakes up from idle on user activity", () => {
    const { result } = renderHook(() => useIdle(TIMEOUT, true))

    advance(TIMEOUT)
    act(() => {
      window.dispatchEvent(new Event("keydown"))
    })

    expect(result.current).toBe(false)
  })

  it("stays active while disabled", () => {
    const { result } = renderHook(() => useIdle(TIMEOUT, false))

    advance(TIMEOUT * 5)

    expect(result.current).toBe(false)
  })

  it("removes its listeners and timer on unmount", () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => useIdle(TIMEOUT, true))

    unmount()

    for (const event of EVENTS) {
      expect(removeEventListener).toHaveBeenCalledWith(event, expect.any(Function))
    }

    expect(vi.getTimerCount()).toBe(0)
  })
})
