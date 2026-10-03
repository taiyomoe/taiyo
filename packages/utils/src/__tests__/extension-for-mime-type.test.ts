import { describe, expect, it } from "vitest"
import { extensionForMimeType } from "../extension-for-mime-type"

describe("extensionForMimeType", () => {
  it("returns 'gif' for image/gif", () => {
    expect(extensionForMimeType("image/gif")).toBe("gif")
  })

  it("returns 'jpg' for image/jpeg", () => {
    expect(extensionForMimeType("image/jpeg")).toBe("jpg")
  })

  it("returns 'jpg' for other image mime types (checkImages normalises to JPEG)", () => {
    expect(extensionForMimeType("image/png")).toBe("jpg")
    expect(extensionForMimeType("image/webp")).toBe("jpg")
  })

  it("returns 'jpg' for unknown mime types as a safe fallback", () => {
    expect(extensionForMimeType("application/octet-stream")).toBe("jpg")
    expect(extensionForMimeType("")).toBe("jpg")
  })

  it("is case-sensitive on the canonical mime form", () => {
    expect(extensionForMimeType("IMAGE/GIF")).toBe("jpg")
  })
})
