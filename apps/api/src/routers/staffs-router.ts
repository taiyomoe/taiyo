import { Hono } from "hono"
import { createStaffHandler } from "../handlers/create-staff-handler"
import { deleteStaffHandler } from "../handlers/delete-staff-handler"
import { getStaffHandler } from "../handlers/get-staff-handler"
import { listStaffsHandler } from "../handlers/list-staffs-handler"
import { updateStaffHandler } from "../handlers/update-staff-handler"

export const staffsRouter = new Hono()
  .route("/", listStaffsHandler)
  .route("/", createStaffHandler)
  .route("/", getStaffHandler)
  .route("/", updateStaffHandler)
  .route("/", deleteStaffHandler)
