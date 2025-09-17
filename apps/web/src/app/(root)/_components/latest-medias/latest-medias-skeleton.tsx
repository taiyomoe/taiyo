import { Meter } from "@taiyomoe/ui/components/meter"
import { Skeleton } from "~/components/ui/skeleton"

export const LatestMediasSkeleton = async () => (
  <div className="overflow-hidden">
    <div className="flex gap-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-7/10 h-[200]" />
          <div className="flex max-h-10 flex-wrap gap-1">
            <Skeleton
              className={`h-4 rounded-sm ${Math.random() < 0.25 ? "w-1/3" : Math.random() < 0.33 ? "w-1/4" : "w-2/3"}`}
            />
            {Math.random() < 0.5 && (
              <Skeleton
                className={`h-4 rounded-sm ${Math.random() < 0.25 ? "w-1/3" : Math.random() < 0.33 ? "w-1/4" : "w-2/3"}`}
              />
            )}
            {Math.random() < 0.5 && (
              <Skeleton
                className={`h-4 rounded-sm ${Math.random() < 0.25 ? "w-1/3" : Math.random() < 0.33 ? "w-1/4" : "w-2/3"}`}
              />
            )}
          </div>
        </div>
      ))}
    </div>
    <Meter
      className="absolute top-2.5 right-0 z-30 w-[200] [&_[data-slot=meter-label]]:hidden [&_[data-slot=meter-value]]:hidden"
      value={0}
    />
  </div>
)
