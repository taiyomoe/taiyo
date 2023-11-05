import Link from "next/link";
import { Skeleton } from "@nextui-org/skeleton";
import type { Scan } from "@prisma/client";
import { UsersIcon } from "lucide-react";
import { tv } from "tailwind-variants";

type Props = {
  scans?: Scan[] | Pick<Scan, "id" | "name">[];
  size?: "sm" | "md";
  orientation?: "horizontal" | "vertical";
};

const displayMediaChapterScans = tv({
  slots: {
    container: "flex w-full",
    iconContainer: "flex items-center",
    linkContainer: "flex gap-1",
    icon: "w-fit",
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
        linkContainer: "flex-row",
      },
      vertical: {
        linkContainer: "flex-col",
        link: "w-fit",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    orientation: "horizontal",
  },
});

export const DisplayMediaChapterScans = (props: Props) => {
  const { scans, size, orientation } = props;
  const {
    container,
    iconContainer,
    linkContainer,
    icon,
    skeleton,
    link,
    text,
  } = displayMediaChapterScans({
    size,
    orientation,
  });

  return (
    <div className={container()}>
      <div className={iconContainer()}>
        <UsersIcon className={icon()} />
      </div>
      {!scans && <Skeleton className={skeleton()} />}
      {scans?.length === 0 && <p className={text()}>None</p>}
      {scans?.length !== 0 && (
        <div className={linkContainer()}>
          {scans?.map((scan) => (
            <Link key={scan.id} className={link()} href={`/scans/${scan.id}`}>
              <p className={text()}>{scan.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
