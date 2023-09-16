import type { ImageProps } from "next/image";
import Image from "next/image";

type Props = { company: "taiyo" | "google" | "discord" } & Omit<
  ImageProps,
  "src" | "alt"
>;

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
    }
  };

  return (
    <div className="flex items-center justify-center">
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
