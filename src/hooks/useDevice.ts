import { useWindowSize } from "./useWindowSize";

export const useDevice = () => {
  const { width } = useWindowSize();

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 768;
  const isLaptop = width >= 768 && width < 1024;
  const isDesktop = width >= 1024 && width < 1280;
  const isWideScreen = width >= 1280;

  return {
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isWideScreen,
  };
};
