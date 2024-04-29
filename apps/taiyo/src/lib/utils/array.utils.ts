/**
 * THIS FILE WILL BE DELETED AS SOON AS POSSIBLE.
 *
 * See this issue: https://github.com/rayepps/radash/pull/289#issuecomment-2082623523
 */

type WorkItemResult<K> = {
  index: number
  result: K
  error: unknown
}
type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never
type UnwrapPromisify<T> = T extends Promise<infer U> ? U : T

export const isFunction = (value: any): value is Function => {
  return !!(value?.constructor && value.call && value.apply)
}

/**
 * Sort an array without modifying it and return
 * the newly sorted value
 */
export const sort = <T>(
  array: readonly T[],
  getter: (item: T) => number,
  desc = false,
) => {
  if (!array) return []
  const asc = (a: T, b: T) => getter(a) - getter(b)
  const dsc = (a: T, b: T) => getter(b) - getter(a)
  return array.slice().sort(desc === true ? dsc : asc)
}

/**
 * Split an array into two array based on
 * a true/false condition function
 */
export const fork = <T>(
  list: readonly T[],
  condition: (item: T) => boolean,
): [T[], T[]] => {
  if (!list) return [[], []]
  return list.reduce(
    (acc, item) => {
      const [a, b] = acc
      if (condition(item)) {
        return [[...a, item], b]
      }

      return [a, [...b, item]]
    },
    [[], []] as [T[], T[]],
  )
}

/**
 * Creates a generator that will produce an iteration through
 * the range of number as requested.
 *
 * @example
 * range(3)                  // yields 0, 1, 2, 3
 * range(0, 3)               // yields 0, 1, 2, 3
 * range(0, 3, 'y')          // yields y, y, y, y
 * range(0, 3, () => 'y')    // yields y, y, y, y
 * range(0, 3, i => i)       // yields 0, 1, 2, 3
 * range(0, 3, i => `y${i}`) // yields y0, y1, y2, y3
 * range(0, 3, obj)          // yields obj, obj, obj, obj
 * range(0, 6, i => i, 2)    // yields 0, 2, 4, 6
 */
export function* range<T = number>(
  startOrLength: number,
  end?: number,
  valueOrMapper: T | ((i: number) => T) = (i) => i as T,
  step = 1,
): Generator<T> {
  const mapper = isFunction(valueOrMapper) ? valueOrMapper : () => valueOrMapper
  const start = end ? startOrLength : 0
  const final = end ?? startOrLength
  for (let i = start; i <= final; i += step) {
    yield mapper(i)
    if (i + step > final) break
  }
}

/**
 * Creates a list of given start, end, value, and
 * step parameters.
 *
 * @example
 * list(3)                  // 0, 1, 2, 3
 * list(0, 3)               // 0, 1, 2, 3
 * list(0, 3, 'y')          // y, y, y, y
 * list(0, 3, () => 'y')    // y, y, y, y
 * list(0, 3, i => i)       // 0, 1, 2, 3
 * list(0, 3, i => `y${i}`) // y0, y1, y2, y3
 * list(0, 3, obj)          // obj, obj, obj, obj
 * list(0, 6, i => i, 2)    // 0, 2, 4, 6
 */
export const list = <T = number>(
  startOrLength: number,
  end?: number,
  valueOrMapper?: T | ((i: number) => T),
  step?: number,
): T[] => {
  return Array.from(range(startOrLength, end, valueOrMapper, step))
}

/**
 * A helper to try an async function without forking
 * the control flow. Returns an error first callback _like_
 * array response as [Error, result]
 */
export const tryit = <TFunction extends (...args: any) => any>(
  func: TFunction,
) => {
  return async (
    ...args: ArgumentsType<TFunction>
  ): Promise<
    [Error, undefined] | [undefined, UnwrapPromisify<ReturnType<TFunction>>]
  > => {
    try {
      return [undefined, await func(...(args as any))]
    } catch (err) {
      return [err as any, undefined]
    }
  }
}

/**
 * Executes many async functions in parallel. Returns the
 * results from all functions as an array. After all functions
 * have resolved, if any errors were thrown, they are rethrown
 * in an instance of AggregateError
 */
export const parallel = async <T, K>(
  limit: number,
  array: readonly T[],
  func: (item: T, index: number, queueIndex: number) => Promise<K>,
): Promise<K[]> => {
  const work = array.map((item, index) => ({
    index,
    item,
  }))
  // Process array items
  const processor =
    (queueIndex: number) =>
    async (res: (value: WorkItemResult<K>[]) => void) => {
      const results: WorkItemResult<K>[] = []
      while (true) {
        const next = work.pop()
        if (!next) return res(results)
        const [error, result] = await tryit(func)(
          next.item,
          next.index,
          queueIndex,
        )
        results.push({
          error,
          result: result as K,
          index: next.index,
        })
      }
    }
  // Create queues
  const queues = list(1, limit).map(
    (queueIndex) => new Promise(processor(queueIndex - 1)),
  )
  // Wait for all queues to complete
  const itemResults = (await Promise.all(queues)) as WorkItemResult<K>[][]
  const [errors, results] = fork(
    sort(itemResults.flat(), (r) => r.index),
    (x) => !!x.error,
  )
  if (errors.length > 0) {
    throw new AggregateError(errors.map((error) => error.error))
  }
  return results.map((r) => r.result)
}
