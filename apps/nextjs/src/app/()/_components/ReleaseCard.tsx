import { Skeleton } from "@nextui-org/skeleton";

export const ReleaseCard = () => {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-[150px] w-[100px] rounded" />
      <div className="flex grow flex-col justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-[20px] w-full rounded" />
          <Skeleton className="h-[20px] w-2/3 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-[20px] w-full rounded" />
          <Skeleton className="h-[20px] w-full rounded" />
        </div>
      </div>
    </div>
  );
};
