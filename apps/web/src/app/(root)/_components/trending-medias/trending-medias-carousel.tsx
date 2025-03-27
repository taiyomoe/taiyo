import { Skeleton } from "~/components/ui/skeleton"

export const TrendingMediasCarousel = () => {
  return (
    <div className="sticky top-[calc(var(--navbar-height)+32px)] flex flex-col gap-4 transition-[top] duration-300">
      <h1 className="font-bold text-2xl">Em alta 🔥</h1>
      <Skeleton className="aspect-7/10 h-[400] max-w-fit" />
    </div>
  )
}
