import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { useSelection } from "../use-selection"

const setup = (visibleIds: readonly string[]) =>
  renderHook(({ ids }) => useSelection(ids), { initialProps: { ids: visibleIds } })

describe("useSelection", () => {
  afterEach(cleanup)

  it("adds and removes toggled ids", () => {
    const { result } = setup(["a", "b", "c"])

    act(() => {
      result.current.toggle("a")
      result.current.toggle("b")
    })

    expect(result.current.ids).toEqual(["a", "b"])
    expect(result.current.has("a")).toBe(true)
    expect(result.current.has("c")).toBe(false)

    act(() => {
      result.current.toggle("a")
    })

    expect(result.current.ids).toEqual(["b"])
    expect(result.current.has("a")).toBe(false)
  })

  it("checks the header once every visible id is picked and marks it indeterminate before", () => {
    const { result } = setup(["a", "b"])

    expect(result.current.header).toMatchObject({ checked: false, indeterminate: false })

    act(() => {
      result.current.toggle("a")
    })

    expect(result.current.header).toMatchObject({ checked: false, indeterminate: true })

    act(() => {
      result.current.toggle("b")
    })

    expect(result.current.header).toMatchObject({ checked: true, indeterminate: false })
  })

  it("picks every visible id on the first header toggle and clears them on the second", () => {
    const { result } = setup(["a", "b", "c"])

    act(() => {
      result.current.header.onToggle()
    })

    expect(result.current.ids).toEqual(["a", "b", "c"])

    act(() => {
      result.current.header.onToggle()
    })

    expect(result.current.ids).toEqual([])
  })

  it("drops picked ids that are no longer visible", () => {
    const { result, rerender } = setup(["a", "b"])

    act(() => {
      result.current.header.onToggle()
    })
    rerender({ ids: ["b", "c"] })

    expect(result.current.ids).toEqual(["b"])
    expect(result.current.header).toMatchObject({ checked: false, indeterminate: true })
  })

  it("empties the selection on clear", () => {
    const { result } = setup(["a", "b"])

    act(() => {
      result.current.header.onToggle()
    })
    act(() => {
      result.current.clear()
    })

    expect(result.current.ids).toEqual([])
    expect(result.current.has("a")).toBe(false)
  })
})
