import type { ImageProps } from "next/image";
import Image from "next/image";
import type { Trackers } from "@prisma/client";

type Props = {
  company:
    | ("taiyo" | "google" | "discord" | "mangadex" | "anilist" | "myanimelist")
    | Trackers;
} & Omit<ImageProps, "src" | "alt">;

export const CompanyLogo = ({
  company,
  width,
  height,
  style,
  ...props
}: Props) => {
  const getSource = (company: Props["company"]) => {
    switch (company) {
      case "taiyo":
        return "/logo-red.svg";
      case "google":
        return "https://asset.brandfetch.io/id6O2oGzv-/idvNIQR3p7.svg";
      case "discord":
        return "https://asset.brandfetch.io/idM8Hlme1a/idyxkTGPf-.svg";
      case "mangadex":
      case "MANGADEX":
        return "https://asset.brandfetch.io/id7o_ziJpI/idm0qVYoeU.svg";
      case "anilist":
      case "ANILIST":
        return "https://asset.brandfetch.io/idbDHw7927/id_dJHPhxa.png";
      case "myanimelist":
      case "MYANIMELIST":
        return "https://asset.brandfetch.io/idi7gXxt9X/id4f3UV7P7.jpeg";
    }
  };

  return (
    <div className="flex select-none items-center justify-center">
      <Image
        src={getSource(company)}
        width={width ?? 0} // Set width explicitly
        height={height ?? 0} // Set height explicitly
        style={{
          width: width ?? "auto",
          height: height ?? "auto",
          ...style,
        }}
        alt="logo"
        {...props}
      />
    </div>
  );
};
