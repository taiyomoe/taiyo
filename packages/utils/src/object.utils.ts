import { diff } from "deep-object-diff"

export const ObjectUtils = {
  areEqualTimed: (a: Record<string, unknown>, b: Record<string, unknown>) => {
    for (const key in a) {
      if (a[key] instanceof Date) {
        delete a[key]
      }
    }

    for (const key in b) {
      if (b[key] instanceof Date) {
        delete b[key]
      }
    }

    return Object.keys(diff(a, b)).length === 0
  },
  deepDiff: diff,
}
