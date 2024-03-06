import _ from "lodash-es"

const enumToArray = <T extends string>(obj: Record<T, unknown>): T[] => {
  return Object.keys(obj).map((key) => key as T)
}

const arrayToSelectItems = <T extends string>(arr: T[]) => {
  return arr.map((item) => ({ label: item, value: item }))
}

const deepDifference = <T extends Record<string, unknown>>(
  object: T,
  base: T,
): Partial<T> => {
  function changes(
    object: Record<string, unknown>,
    base: Record<string, unknown>,
  ) {
    return _.transform(
      object,
      (result: Record<string, unknown>, value, key) => {
        if (!_.isEqual(value, base[key])) {
          result[key] =
            _.isObject(value) && _.isObject(base[key])
              ? changes(
                  value as Record<string, unknown>,
                  base[key] as Record<string, unknown>,
                )
              : value
        }
      },
    )
  }

  return changes(object, base) as Partial<T>
}

export const ObjectUtils = {
  enumToArray,
  arrayToSelectItems,
  deepDifference,
}
