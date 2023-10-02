import { cn } from "~/utils/cn";

type Props = {
  order: "unique" | "first" | "middle" | "last";
};

export const MediaChapterCardPath = ({ order }: Props) => {
  return (
    <div className="flex min-h-full w-[14px]">
      <div className="flex w-[4px] flex-col">
        <span
          className={cn("bg-content3 h-[24px] w-full rounded", {
            "rounded-b-none": order === "first",
            "rounded-t-none": order === "last",
            "rounded-br-none": order === "last" || order === "unique",
            "mt-2 h-[16px]": order === "unique" || order === "first",
          })}
        />
        <span
          className={cn("bg-content3 h-full w-full rounded", {
            "rounded-b-none rounded-t-none": order === "first",
            hidden: order === "last" || order === "unique",
          })}
        />
      </div>
      <div className="flex w-[10px]">
        <span className="bg-content3 mt-5 h-[4px] w-[10px] rounded rounded-l-none" />
      </div>
    </div>
  );
};
