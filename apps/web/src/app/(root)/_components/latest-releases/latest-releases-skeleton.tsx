import { Skeleton } from "~/components/ui/skeleton"

export const LatestReleasesSkeleton = () => {
  return (
    <div className="flex min-h-[600px] w-full flex-col gap-4">
      <h3 className="font-bold text-2xl">Lançamentos</h3>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-[200]" />
        <Skeleton className="h-12 w-[200]" />
        <Skeleton className="h-12 w-[200]" />
      </div>
    </div>
  )
}
