export const keepPreviousData =
  <TData>(initialData: TData) =>
  (data?: TData) => {
    if (!data) return initialData

    return data
  }
