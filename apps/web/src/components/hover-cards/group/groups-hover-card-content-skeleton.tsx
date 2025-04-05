import { Skeleton } from "~/components/ui/skeleton"

export const GroupsHoverCardContentSkeleton = () => (
  <>
    <div className="-mx-3 -mt-3 relative">
      <Skeleton className="h-16 rounded-none" />
      <div className="absolute top-0 h-full max-h-16 w-full bg-[linear-gradient(to_bottom,hsla(var(--background),0.6),hsla(var(--background)))]" />
    </div>
    <div className="-mt-6 flex items-end gap-2">
      <Skeleton className="size-12 rounded-full" />
      <Skeleton className="h-6 w-36 rounded-sm" />
    </div>
    <div className="mt-3 flex flex-wrap gap-1">
      <Skeleton className="h-5 w-28 rounded-sm" />
      <Skeleton className="h-5 w-32 rounded-sm" />
      <Skeleton className="h-5 w-16 rounded-sm" />
      <Skeleton className="h-5 w-36 rounded-sm" />
    </div>
    <div className="mt-3 flex justify-between">
      <Skeleton className="h-5 w-24 rounded-sm" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 rounded-sm" />
        <Skeleton className="size-5 rounded-sm" />
        <Skeleton className="size-5 rounded-sm" />
      </div>
    </div>
  </>
)
