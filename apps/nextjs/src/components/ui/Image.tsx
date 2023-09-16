"use client";

import { useState } from "react";
import type { ImageProps as NextImageProps } from "next/image";
import NextImage from "next/image";

import type { SkeletonProps } from "./Skeleton";
import { Skeleton } from "./Skeleton";

type Props = Omit<NextImageProps, "src"> & {
  src: NextImageProps["src"] | null | undefined;
  skeletonProps?: Omit<SkeletonProps, "className" | "style">;
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
      className={props.className}
      style={{
        display: loaded ? "none" : "block",
        ...style,
      }}
      classes={{ container: classes?.container }}
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
