import { RouterProvider, createRouter } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { getLocale } from "@/paraglide/runtime"
import { routeTree } from "./routeTree.gen"
import "./styles.css"

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Register {
    router: typeof router
  }
}

const root = document.querySelector("#root")

if (root !== null) {
  document.documentElement.lang = getLocale()
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
