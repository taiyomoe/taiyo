import { Hono } from "hono"
import { getDashboardOverviewHandler } from "../handlers/get-dashboard-overview-handler"

export const dashboardRouter = new Hono().route("/", getDashboardOverviewHandler)
