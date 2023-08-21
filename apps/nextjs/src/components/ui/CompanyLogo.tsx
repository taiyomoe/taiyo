import type { ImageProps } from "next/image";
import Image from "next/image";

type Props = { company: "taiyo" | "google" | "discord" } & Omit<
  ImageProps,
  "src" | "alt"
>;

export const CompanyLogo = ({
  company,
  width = 150,
  height = 150,
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
    <div className="flex items-center justify-center" style={{ width, height }}>
      <Image
        src={getSource(company)}
        alt="logo"
        layout="responsive" // Set layout to responsive
        width={width} // Set width explicitly
        height={height} // Set height explicitly
        {...props}
      />
    </div>
  );
};
