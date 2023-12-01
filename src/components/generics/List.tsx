import React from "react";
import { Divider } from "@nextui-org/divider";

type Props = {
  children: React.ReactNode;
};

export const List = ({ children }: Props) => {
  const childrenWithDividers = React.Children.map(children, (child, index) => (
    <>
      {child}
      {index !== React.Children.count(children) - 1 && (
        <Divider className="my-2" />
      )}
    </>
  ));

  return <div className="flex flex-col">{childrenWithDividers}</div>;
};
