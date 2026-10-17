import { useLocation, useSearch } from "@tanstack/react-router"

export const useAuthRedirect = () => useSearch({ from: "/auth" }).redirect ?? "/"

export const useCurrentHref = () => useLocation({ select: (location) => location.href })
