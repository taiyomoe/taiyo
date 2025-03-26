import { Skeleton } from "~/components/ui/skeleton"

export const FeaturedMediasSkeleton = () => {
  return (
    <>
      <Skeleton className="h-[340px] md:h-[400px] xl:h-[440px]" />
      <div className="absolute top-0 h-full max-h-[340px] w-full bg-[linear-gradient(to_bottom,hsla(var(--background),0.6),hsla(var(--background)))] md:max-h-[400px] xl:max-h-[440px]" />
    </>
  )
}
