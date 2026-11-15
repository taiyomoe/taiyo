import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/titles")({
  beforeLoad: ({ location }) => {
    throw redirect({ href: `/media${location.searchStr}`, statusCode: 301 })
  },
})
