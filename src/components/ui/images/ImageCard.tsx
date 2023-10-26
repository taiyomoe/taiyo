import { tv } from "@nextui-org/react";
import { GripHorizontalIcon } from "lucide-react";
import prettyBytes from "pretty-bytes";

type Props = {
  file: File;
};

const imageCard = tv({
  slots: {
    container: "relative flex gap-2 rounded-medium max-w-full",
    image: "object-cover w-[100px] md:w-[150px] h-[150px] rounded-l-medium",
    contentWrapper: "p-2 flex grow flex-col justify-between",
    iconContainer: "items-center p-2 hidden sm:flex",
    fileNameText: "line-clamp-1 h-fit text-ellipsis",
    fileDetailsContainer: "flex flex-col gap-1",
  },
});

export const ImageCard = ({ file }: Props) => {
  const {
    container,
    image,
    iconContainer,
    contentWrapper,
    fileNameText,
    fileDetailsContainer,
  } = imageCard();

  return (
    <div className={container()}>
      <img
        className={image()}
        src={URL.createObjectURL(file)}
        alt={`image preview`}
      />
      <div className={contentWrapper()}>
        <p className={fileNameText()}>{file.name}</p>
        <div className={fileDetailsContainer()}>
          <p>Tamanho: {prettyBytes(file.size)}</p>
          <p>Extensão: {file.type}</p>
        </div>
      </div>
      <div className={iconContainer()}>
        <GripHorizontalIcon size={32} />
      </div>
    </div>
  );
};
