import { Skeleton } from "~/components/ui/skeleton"

export const FeaturedMediasSkeleton = () => {
  return (
    <div className="relative">
      <Skeleton className="h-(--featured-media-card-height) rounded-none brightness-80" />
      <div className="absolute top-0 h-full max-h-(--featured-media-card-height) w-full bg-[linear-gradient(to_bottom,hsla(var(--background),0.6),hsla(var(--background)))]" />
      <div className="absolute inset-x-0 top-0 left-0 mx-auto mt-[48] flex w-full max-w-9xl gap-4 p-4">
        <Skeleton className="aspect-7/10 h-[160] max-w-fit md:h-[270] xl:h-[300]" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full md:w-2/3" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-[25] w-[60]" />
            <Skeleton className="h-[25] w-[50]" />
            <Skeleton className="h-[25] w-[70]" />
            <Skeleton className="h-[25] w-[55]" />
            <Skeleton className="h-[25] w-[60]" />
          </div>
          <div className="hidden max-h-[136] flex-wrap gap-1 overflow-hidden md:flex lg:max-h-[164]">
            <Skeleton className="h-6 w-[200]" />
            <Skeleton className="h-6 w-[130]" />
            <Skeleton className="h-6 w-[150]" />
            <Skeleton className="h-6 w-[230]" />
            <Skeleton className="h-6 w-[120]" />
            <Skeleton className="h-6 w-[170]" />
            <Skeleton className="h-6 w-[100]" />
            <Skeleton className="h-6 w-[130]" />
            <Skeleton className="h-6 w-[80]" />
            <Skeleton className="h-6 w-[200]" />
            <Skeleton className="h-6 w-[240]" />
            <Skeleton className="h-6 w-[190]" />
            <Skeleton className="h-6 w-[200]" />
            <Skeleton className="h-6 w-[120]" />
            <Skeleton className="h-6 w-[150]" />
            <Skeleton className="h-6 w-[150]" />
            <Skeleton className="h-6 w-[140]" />
          </div>
        </div>
      </div>
    </div>
  )
}
