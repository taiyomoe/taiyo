import NextImage from "next/image";
import { Image } from "@nextui-org/image";
import type { SlotsToClasses } from "@nextui-org/react";

import { cn } from "~/lib/utils/cn";

type Props = {
  classNames: SlotsToClasses<"height" | "width" | "wrapper" | "img">;
  maxHeight: number;
  maxWidth: number;
  src: string;
  alt: string;
};

export const MediaImage = (props: Props) => (
  <Image
    as={NextImage}
    src={props.src}
    classNames={{
      wrapper: cn(
        "!max-w-full z-0",
        props.classNames?.width,
        props.classNames?.wrapper,
      ),
      img: cn("object-cover", props.classNames?.height, props.classNames?.img),
    }}
    height={props.maxHeight}
    width={props.maxWidth}
    alt={props.alt}
  />
);
