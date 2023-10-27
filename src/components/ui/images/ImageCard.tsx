import { Spinner } from "@nextui-org/react";
import prettyBytes from "pretty-bytes";

import { type SelectedImage } from "~/lib/types";
import { cn } from "~/utils/cn";

type Props = {
  position: string;
} & SelectedImage;

export const ImageCard = ({ file, status, position }: Props) => {
  return (
    <div
      className={cn(
        "relative flex max-w-full gap-2 rounded-medium bg-default-200",
        { "opacity-10": status === "compressing" },
      )}
    >
      <Spinner
        className={cn(
          "absolute left-[calc(50%-20px)] top-[calc(50%-20px)] hidden",
          {
            block: status === "compressing",
          },
        )}
        size="lg"
      />
      <img
        className="h-[150px] w-[100px] rounded-l-medium object-cover md:w-[150px]"
        src={URL.createObjectURL(file)}
        alt={`image preview`}
      />
      <div className="flex grow flex-col gap-2 p-2">
        <div className="flex justify-between gap-2">
          <p className="line-clamp-1 h-fit text-ellipsis">{file.name}</p>
          <p className="px-2">{position}</p>
        </div>
        <div className="flex grow justify-between">
          <div className="flex flex-col justify-end gap-1">
            <p>Tamanho: {prettyBytes(file.size)}</p>
            <p>Extensão: {file.type}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
