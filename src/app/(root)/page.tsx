import { LatestMedias } from "./_components/LatestMedias";
import { LatestReleases } from "./_components/LatestReleases";
import { MediaShowcase } from "./_components/MediaShowcase";
import { TrendingMedias } from "./_components/TrendingMedias";

export default function HomePage() {
  return (
    <main className="flex h-full flex-col p-6">
      <div className="flex flex-col gap-12">
        <MediaShowcase />
        <div className="flex w-full flex-col gap-12 md:flex-row">
          <LatestReleases />
          <TrendingMedias />
        </div>
        <LatestMedias />
      </div>
    </main>
  );
}
