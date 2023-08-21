import Image from "next/image";

type Props = {
  className?: string;
  width: number;
  height: number;
};

export const DiscordLogo = ({ className, width, height }: Props) => {
  return (
    <Image
      className={className}
      src="https://asset.brandfetch.io/idM8Hlme1a/idyxkTGPf-.svg"
      width={width}
      height={height}
      alt="logo"
    />
  );
};
