import { describe, expect, it, vi } from "vitest"
import { normalizeDisplayName } from "../normalize-display-name"

// Mock faker to return a predictable value
vi.mock("@faker-js/faker", () => ({
  faker: {
    internet: {
      username: vi.fn(() => "generated_username"),
    },
  },
}))

describe("normalizeDisplayName", () => {
  it("should preserve spaces", () => {
    expect(normalizeDisplayName("john doe")).toBe("john doe")
    expect(normalizeDisplayName("test user name")).toBe("test user name")
  })

  it("should preserve case", () => {
    expect(normalizeDisplayName("JohnDoe")).toBe("JohnDoe")
    expect(normalizeDisplayName("TEST_USER")).toBe("TEST_USER")
  })

  it("should remove invalid characters", () => {
    expect(normalizeDisplayName("john@doe")).toBe("johndoe")
    expect(normalizeDisplayName("test-user!")).toBe("testuser")
    expect(normalizeDisplayName("user#123")).toBe("user123")
  })

  it("should preserve valid characters including spaces, dots, and underscores", () => {
    expect(normalizeDisplayName("john_doe")).toBe("john_doe")
    expect(normalizeDisplayName("user.name")).toBe("user.name")
    expect(normalizeDisplayName("test 123")).toBe("test 123")
    expect(normalizeDisplayName("John Doe")).toBe("John Doe")
  })

  it("should truncate to maxLength (30)", () => {
    const longInput = "a".repeat(50)
    const result = normalizeDisplayName(longInput)

    expect(result.length).toBe(30)
    expect(result).toBe("a".repeat(30))
  })

  it("should return faker username if normalized length is less than minLength (3)", () => {
    expect(normalizeDisplayName("ab")).toBe("generated_username")
    expect(normalizeDisplayName("a")).toBe("generated_username")
    expect(normalizeDisplayName("")).toBe("generated_username")
  })

  it("should return normalized value if length is at least minLength (3)", () => {
    expect(normalizeDisplayName("abc")).toBe("abc")
    expect(normalizeDisplayName("test")).toBe("test")
  })

  it("should handle mixed case and special characters", () => {
    expect(normalizeDisplayName("John Doe!")).toBe("John Doe")
    expect(normalizeDisplayName("Test-User@123")).toBe("TestUser123")
  })

  it("should preserve multiple spaces", () => {
    expect(normalizeDisplayName("john  doe")).toBe("john  doe")
    expect(normalizeDisplayName("test   user")).toBe("test   user")
  })

  it("should handle edge cases", () => {
    expect(normalizeDisplayName("   ")).toBe("   ")
    expect(normalizeDisplayName("!!!")).toBe("generated_username")
    expect(normalizeDisplayName("a b")).toBe("a b")
  })
})
