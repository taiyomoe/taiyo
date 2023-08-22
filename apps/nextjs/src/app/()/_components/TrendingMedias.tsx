import { Skeleton } from "~/components/ui/Skeleton";

export const TrendingMedias = () => {
  return (
    <div className="flex h-auto min-w-[300px] flex-col gap-6">
      <p className="text-2xl font-medium">Em alta</p>
      <Skeleton className="max-w-[350px] grow" />
    </div>
  );
};
