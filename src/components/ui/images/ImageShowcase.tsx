"use client";

import { useState } from "react";
import { tv } from "@nextui-org/react";
import { Reorder } from "framer-motion";

import { ImageCard } from "./ImageCard";

type Props = {
  images: File[];
};

const imageShowcase = tv({
  slots: {
    reorderGroup: "flex flex-col gap-2",
    reorderItem: "bg-default-200 rounded-medium",
  },
});

export const ImageShowcase = ({ images }: Props) => {
  const { reorderGroup, reorderItem } = imageShowcase();
  const [items, setItems] = useState(images);

  return (
    <Reorder.Group
      className={reorderGroup()}
      values={items}
      onReorder={setItems}
      axis="y"
    >
      {items.map((item) => (
        <Reorder.Item className={reorderItem()} key={item.name} value={item}>
          <ImageCard file={item} />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};
