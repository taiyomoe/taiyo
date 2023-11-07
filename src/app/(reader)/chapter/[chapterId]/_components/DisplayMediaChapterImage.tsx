import Image from "next/image";

type Props = {
  url: string;
  hide: boolean;
};

export const DisplayMediaChapterImage = ({ url, hide }: Props) => {
  return (
    <Image
      src={url}
      style={{
        opacity: hide ? "0" : "1",
        objectFit: "contain",
        height: hide ? "0px" : "100%",
        width: "100%",
      }}
      sizes="1"
      width={0}
      height={0}
      alt="image"
    />
  );
};
