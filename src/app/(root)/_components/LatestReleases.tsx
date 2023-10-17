import { Skeleton } from "@nextui-org/skeleton";

import { ReleaseCard } from "./ReleaseCard";

export const LatestReleases = () => {
  return (
    <div className="flex grow flex-col gap-6">
      <div className="flex justify-between">
        <p className="text-2xl font-medium">Lançamentos</p>
        <Skeleton className="w-32 rounded" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ReleaseCard />
        <ReleaseCard />
        <ReleaseCard />
        <ReleaseCard />
        <ReleaseCard />
        <ReleaseCard />
      </div>
    </div>
  );
};
