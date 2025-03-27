import { Skeleton } from "~/components/ui/skeleton"

export const FeaturedMediasSkeleton = () => {
  return (
    <div className="relative">
      <Skeleton className="h-(--featured-media-card-height)" />
      <div className="absolute top-0 h-full max-h-(--featured-media-card-height) w-full bg-[linear-gradient(to_bottom,hsla(var(--background),0.6),hsla(var(--background)))]" />
    </div>
  )
}
