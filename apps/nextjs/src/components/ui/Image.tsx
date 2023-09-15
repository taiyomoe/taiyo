import { useState } from "react";
import type { ImageProps } from "next/image";
import NextImage from "next/image";

import type { SkeletonProps } from "./Skeleton";
import { Skeleton } from "./Skeleton";

type Props = Omit<ImageProps, "src"> & {
  src: ImageProps["src"] | null | undefined;
  skeletonProps?: SkeletonProps;
  classes?: { container?: string };
};

export const Image = ({
  skeletonProps,
  src,
  style,
  classes,
  ...props
}: Props) => {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setLoaded(false);
  };

  const renderSkeleton = () => (
    <Skeleton
      style={{
        width: props.width,
        height: props.height,
        display: loaded ? "none" : "block",
        ...style,
      }}
      {...skeletonProps}
    />
  );

  if (!src) return renderSkeleton();

  return (
    <div className={classes?.container}>
      {renderSkeleton()}
      <NextImage
        src={src}
        style={{
          visibility: loaded ? "initial" : "hidden",
          position: loaded ? "initial" : "absolute",
          ...style,
        }}
        onLoadingComplete={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export type ImageProps = Props;
