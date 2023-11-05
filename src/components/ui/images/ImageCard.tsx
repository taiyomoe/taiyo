import { Spinner, tv } from "@nextui-org/react";
import prettyBytes from "pretty-bytes";

import type { SelectedImage } from "~/lib/types";

type Props = {
  position: string;
} & Omit<SelectedImage, "type">;

const imageCard = tv({
  slots: {
    container: "relative flex max-w-full rounded-medium bg-default-200",
    spinner: "absolute left-[calc(50%-20px)] top-[calc(50%-20px)] hidden",
    imagePreview:
      "h-[150px] w-[100px] rounded-l-medium object-cover md:w-[150px]",
    contentContainer: "flex grow flex-col gap-2 p-2",
    upperContentContainer: "flex justify-between gap-2",
    lowerContentContainer: "flex grow flex-col justify-end gap-1",
    fileNameText: "line-clamp-1 h-fit text-ellipsis",
    filePositionText: "px-2",
    fileSizeText: "w-fit rounded-lg px-2 py-1",
    fileTypeText: "w-fit rounded-lg px-2 py-1",
  },
  variants: {
    status: {
      pending: {},
      compressing: {
        container: "opacity-10",
        spinner: "block",
      },
      compressed: {},
    },
    isJpeg: {
      true: {
        fileTypeText: "bg-success-200",
      },
      false: {
        fileTypeText: "bg-danger-200",
      },
    },
  },
});

export const ImageCard = ({ file, status, position }: Props) => {
  const {
    container,
    spinner,
    imagePreview,
    contentContainer,
    upperContentContainer,
    lowerContentContainer,
    fileNameText,
    filePositionText,
    fileSizeText,
    fileTypeText,
  } = imageCard({
    status,
    isJpeg: file.type === "image/jpeg",
  });

  return (
    <div className={container()}>
      <Spinner className={spinner()} size="lg" />
      <img
        className={imagePreview()}
        src={URL.createObjectURL(file)}
        alt={`image preview`}
      />
      <div className={contentContainer()}>
        <div className={upperContentContainer()}>
          <p className={fileNameText()}>{file.name}</p>
          <p className={filePositionText()}>{position}</p>
        </div>
        <div className={lowerContentContainer()}>
          <p className={fileSizeText()}>Tamanho: {prettyBytes(file.size)}</p>
          <p className={fileTypeText()}>Extensão: {file.type}</p>
        </div>
      </div>
    </div>
  );
};
