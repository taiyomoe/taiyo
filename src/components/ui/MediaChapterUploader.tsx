import Link from "next/link";
import { Skeleton } from "@nextui-org/skeleton";
import type { User } from "@prisma/client";
import { UserIcon } from "lucide-react";
import { tv } from "tailwind-variants";

type Props = {
  className?: string;
  uploader?: User | Pick<User, "id" | "name">;
  size?: "sm" | "md";
};

const mediaChapterUploader = tv({
  slots: {
    container: "flex w-full items-center",
    icon: "w-fit",
    skeleton: "grow",
    link: "hover:bg-content3 select-none px-2",
  },
  variants: {
    size: {
      sm: {
        container: "gap-1",
        icon: "h-4 md:h-5",
        skeleton: "rounded",
        link: "text-sm rounded",
      },
      md: {
        container: "gap-2",
        icon: "h-5",
        skeleton: "rounded-md h-6",
        link: "text-md rounded-md",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export const MediaChapterUploader = ({ uploader, size, className }: Props) => {
  const slots = mediaChapterUploader({ size });

  return (
    <div className={slots.container({ className })}>
      <UserIcon className={slots.icon()} />
      {!uploader && <Skeleton className={slots.skeleton()} />}
      {uploader && (
        <Link className={slots.link()} href={`/users/${uploader.id}`}>
          <p>{uploader.name}</p>
        </Link>
      )}
    </div>
  );
};
