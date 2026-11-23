import { sendEmail } from "./client"
import DataExportReadyEmail from "./templates/data-export-ready-email"

export type DataExportReadyMail = {
  to: string
  name: string
  expiresInDays: number
  url: string | null
}

export const sendDataExportReadyEmail = async ({ to, ...props }: DataExportReadyMail) => {
  await sendEmail({
    to,
    subject: "Your Taiyō data is ready to download",
    react: <DataExportReadyEmail {...props} />,
  })
}
