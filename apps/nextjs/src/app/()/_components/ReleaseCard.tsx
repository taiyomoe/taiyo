import { Skeleton } from "~/components/ui/Skeleton";

export const ReleaseCard = () => {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-[150px] w-[100px] rounded-lg" />
      <div className="flex grow flex-col justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-[20px] w-full" />
          <Skeleton className="h-[20px] w-2/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-[20px] w-full" />
          <Skeleton className="h-[20px] w-full" />
        </div>
      </div>
    </div>
  );
};
