import Link from "next/link";
import { Skeleton } from "@nextui-org/skeleton";
import { UsersIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import type { Scan, Scans } from "@taiyo/db/types/scan.types";

type Props = {
  scans?: Scans | Pick<Scan, "id" | "name">[];
  size?: "sm" | "md";
};

const displayMediaChapterScans = tv({
  slots: {
    container: "flex w-full items-center",
    icon: "w-fit",
    skeleton: "grow",
    link: "hover:bg-content3",
    text: "select-none px-2",
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
        icon: "h-5",
        skeleton: "rounded-md h-6",
        link: "rounded-md",
        text: "text-md",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export const DisplayMediaChapterScans = ({ scans, size }: Props) => {
  const { container, icon, skeleton, link, text } = displayMediaChapterScans({
    size,
  });

  return (
    <div className={container()}>
      <UsersIcon className={icon()} />
      {!scans && <Skeleton className={skeleton()} />}
      {scans?.length === 0 && <p className={text()}>None</p>}
      {scans?.length !== 0 &&
        scans?.map((scan) => (
          <Link key={scan.id} className={link()} href={`/scans/${scan.id}`}>
            <p className={text()}>{scan.name}</p>
          </Link>
        ))}
    </div>
  );
};
