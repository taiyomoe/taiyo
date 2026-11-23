import { sendEmail } from "./client"
import DataExportReadyEmail from "./templates/data-export-ready-email"

export type DataExportReadyMail = {
  to: string
  name: string
  expiresInDays: number
  url: string | null
}

export const sendDataExportReadyEmail = ({ to, ...props }: DataExportReadyMail) =>
  sendEmail({
    to,
    subject: "Your Taiyō data is ready to download",
    react: <DataExportReadyEmail {...props} />,
  })
