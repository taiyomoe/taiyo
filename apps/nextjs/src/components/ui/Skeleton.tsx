import { cn } from "~/utils/cn";

type Props = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton = ({ className, ...props }: Props) => {
  return (
    <div className="rounded-md bg-background shadow-lg shadow-background">
      <div
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
      />
    </div>
  );
};

export type SkeletonProps = Props;
