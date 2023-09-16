import { cn } from "~/utils/cn";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  classes?: { container?: string };
};

export const Skeleton = ({ className, classes, ...props }: Props) => {
  return (
    <div
      className={cn(
        "rounded-md bg-background shadow-lg shadow-background",
        classes?.container,
      )}
    >
      <div
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
      />
    </div>
  );
};

export type SkeletonProps = Props;
