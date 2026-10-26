import { useLocation } from "@tanstack/react-router"

export const useCurrentHref = () => useLocation({ select: (location) => location.href })
