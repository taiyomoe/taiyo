import { useSearch } from "@tanstack/react-router"

export const useAuthRedirect = () => useSearch({ from: "/auth" }).redirect ?? "/"
