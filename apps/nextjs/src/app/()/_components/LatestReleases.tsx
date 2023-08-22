import { ReleaseCard } from "./ReleaseCard";

export const LatestReleases = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xl font-medium">Lançamentos</p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ReleaseCard />
        <ReleaseCard />
        <ReleaseCard />
        <ReleaseCard />
        <ReleaseCard />
      </div>
    </div>
  );
};
