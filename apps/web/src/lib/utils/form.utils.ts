import {
  get,
  keys,
  mapEntries,
  mapValues,
  objectify,
  omit,
  shake,
  unique,
} from "radash"
import type { FieldValues } from "react-hook-form"

/**
 * Recursively get all overlapping values of a field in a form. Works with nested fields and arrays.
 *
 * @example
 * const values = {
 *   volumes: [
 *     { ids: ["id_1", "id_2"] },
 *     { ids: ["id_3", "id_4"] },
 *     { ids: ["id_2", "id_5"] },
 *   ]
 * }
 *
 * getOverlappingValues(values, "volumes.0.ids") // { "volumes.0.ids": ["id_2"], "volumes.2.ids": ["id_2"] }
 */
const getOverlappingValues = (values: FieldValues, path: string) => {
  const siblings = getSiblingsNames(values, path)
  const fieldsValues = objectify(
    siblings,
    (f) => f,
    (f) => get(values, f) as unknown[],
  )
  const filteredFieldsValues = mapEntries(fieldsValues, (k, values) => [
    k,
    values.filter((v) =>
      Object.values(omit(fieldsValues, [k]))
        .flat()
        .some((other) => other === v),
    ),
  ])

  return shake(
    mapValues(filteredFieldsValues, (v) => (v.length ? v : undefined)),
  ) as Record<string, unknown[]>
}

/**
 * Get all sibling names of a field in a form.
 *
 * @example
 * const values = {
 *   volumes: [
 *     { ids: ["id_1", "id_2"] },
 *     { ids: [] },
 *   ]
 * }
 *
 * getSiblingsNames(values, "volumes.0.ids") // ["volumes.0.ids", "volumes.1.ids"]
 */
const getSiblingsNames = (values: FieldValues, path: string) => {
  const names = unique(keys(values).map((k) => k.replace(/\.\d+$/, "")))
  const regex = new RegExp(`^${path.replace(/\.\d+\./g, "\\.\\d+\\.")}$`)

  return names.filter((k) => k.match(regex))
}

export const FormUtils = {
  getOverlappingValues,
  getSiblingsNames,
}
