import { useEffect, useState } from "react";

type Props = {
  min: number;
  max: number;
};

export const useScrollOpacity = ({ min, max }: Props) => {
  const computeOpacity = () => {
    const currentScrollPos = window.scrollY;

    if (currentScrollPos < min) {
      return 0;
    } else if (currentScrollPos < max) {
      return (currentScrollPos - min) / (max - min);
    } else {
      return 1;
    }
  };

  const [opacity, setOpacity] = useState(computeOpacity());

  const handleScroll = () => {
    setOpacity(computeOpacity());
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  });

  return { opacity };
};
