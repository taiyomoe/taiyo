import { useMediaQuery } from "usehooks-ts"

export const useDevice = () => {
  const isAboveMobile = useMediaQuery("(min-width: 640px)")
  const isAboveTablet = useMediaQuery("(min-width: 768px)")
  const isAboveLaptop = useMediaQuery("(min-width: 1024px)")
  const isAboveDesktop = useMediaQuery("(min-width: 1280px)")

  return {
    isMobile: !isAboveMobile,
    isTablet: isAboveMobile && !isAboveTablet,
    isLaptop: isAboveTablet && !isAboveLaptop,
    isDesktop: isAboveLaptop && !isAboveDesktop,
    isWideScreen: isAboveDesktop,

    isAboveMobile,
    isAboveTablet,
    isAboveLaptop,
    isAboveDesktop,
  }
}
