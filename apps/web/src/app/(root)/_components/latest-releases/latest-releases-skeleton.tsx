import { Skeleton } from "~/components/ui/skeleton"

export const LatestReleasesSkeleton = () => {
  return (
    <div className="w-full space-y-4">
      <h3 className="font-bold text-2xl">Lançamentos</h3>
      <div className="grid max-h-[584] grid-cols-1 gap-4 overflow-hidden md:max-h-[784] xl:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="flex rounded border border-subtle bg-muted">
            <Skeleton className="aspect-7/10 h-[80]" />
            <div className="flex w-full flex-col justify-between gap-2 p-1 pl-2 text-sm text-subtle">
              <Skeleton className="h-5 w-2/3 rounded-sm" />
              <div className="grid grid-cols-[auto_112px] grid-rows-2 gap-x-1 gap-y-0.5">
                <Skeleton className="h-5 w-2/3 rounded-sm" />
                <Skeleton className="h-5 w-[110] justify-self-end rounded-sm" />
                <Skeleton className="h-5 w-2/5 rounded-sm" />
                <Skeleton className="h-5 w-[80] justify-self-end rounded-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
