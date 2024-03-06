import { useWindowSize } from "usehooks-ts"

export const useDevice = () => {
  const { width } = useWindowSize()

  const isAboveMobile = width >= 640
  const isAboveTablet = width >= 768
  const isAboveLaptop = width >= 1024
  const isAboveDesktop = width >= 1280

  const isMobile = !isAboveMobile
  const isTablet = isAboveMobile && !isAboveTablet
  const isLaptop = isAboveTablet && !isAboveLaptop
  const isDesktop = isAboveLaptop && !isAboveDesktop
  const isWideScreen = isAboveDesktop

  if (!width) {
    return null
  }

  return {
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isWideScreen,

    isAboveMobile,
    isAboveTablet,
    isAboveLaptop,
    isAboveDesktop,
  }
}
