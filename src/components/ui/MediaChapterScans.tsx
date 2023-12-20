import Link from "next/link";
import type { VariantProps } from "@nextui-org/react";
import { Skeleton } from "@nextui-org/skeleton";
import type { Scan } from "@prisma/client";
import { UsersIcon } from "lucide-react";
import { tv } from "tailwind-variants";

type Props = {
  scans?: Scan[] | Pick<Scan, "id" | "name">[];
} & VariantProps<typeof mediaChapterScans>;

const mediaChapterScans = tv({
  slots: {
    container: "flex w-full",
    iconContainer: "flex items-center",
    linkContainer: "flex gap-1",
    icon: "w-auto",
    skeleton: "grow",
    link: "hover:bg-content3",
    text: "select-none px-2 truncate",
  },
  variants: {
    size: {
      sm: {
        container: "gap-1",
        icon: "h-4 md:h-5", // intentional md:h-5
        skeleton: "rounded",
        link: "rounded",
        text: "text-sm",
      },
      md: {
        container: "gap-2",
        iconContainer: "h-6",
        icon: "h-5",
        skeleton: "rounded-md h-6",
        link: "rounded-md",
        text: "text-md",
      },
    },
    orientation: {
      horizontal: {
        linkContainer: "flex-row overflow-x-scroll scrollbar-none",
      },
      vertical: {
        linkContainer: "flex-col",
        link: "w-fit",
      },
    },
    isCompact: {
      true: {
        linkContainer: "max-w-[150px]",
        text: "truncate",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    orientation: "horizontal",
  },
});

export const MediaChapterScans = (props: Props) => {
  const { scans, size, orientation, isCompact } = props;
  const slots = mediaChapterScans({ size, orientation });

  const scansToDisplay = isCompact ? scans?.slice(0, 1) : scans;
  const otherScansCount =
    scans && scansToDisplay ? scans.length - scansToDisplay.length : 0;

  return (
    <div className={slots.container()}>
      <div className={slots.iconContainer()}>
        <UsersIcon className={slots.icon()} />
      </div>
      {scans === undefined && <Skeleton className={slots.skeleton()} />}
      {scans && scans.length === 0 && <p className={slots.text()}>Sem scans</p>}
      {scans && scans.length !== 0 && (
        <div className={slots.linkContainer()}>
          {scansToDisplay?.map((scan) => (
            <Link
              key={scan.id}
              className={slots.link()}
              href={`/scans/${scan.id}`}
            >
              <p className={slots.text()}>{scan.name}</p>
            </Link>
          ))}
          {isCompact && otherScansCount !== 0 && (
            <p className={slots.text()}>+{otherScansCount}</p>
          )}
        </div>
      )}
    </div>
  );
};
