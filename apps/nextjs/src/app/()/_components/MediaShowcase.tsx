import { Skeleton } from "~/components/ui/Skeleton";

export const MediaShowcase = () => {
  return (
    <div className="w-full">
      <Skeleton className="h-[200px] w-full md:h-[500px]" />
    </div>
  );
};
