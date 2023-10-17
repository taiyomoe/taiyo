import { useEffect, useState } from "react";

export const useNavbarScroll = () => {
  const [opacity, setOpacity] = useState(0);

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;

    if (currentScrollPos < 100) {
      setOpacity(currentScrollPos / 100);
    } else {
      setOpacity(1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  });

  return { opacity };
};
