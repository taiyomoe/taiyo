# Emails

The react-email templates the API and the worker send through Amazon SES.

- `send-auth-email.tsx` renders the emails Better Auth asks for, including the account deletion link and the goodbye email. `createAuth` takes it as `sendEmail`, so `@taiyomoe/auth` holds no templates.
- `send-group-invitation-email.tsx` sends group invitations, through the API's `services.mailer`.
- `send-data-export-ready-email.tsx` tells a user their data export is ready, from the worker.

`sendEmail` in `client.ts` sends from `Taiyō <no-reply@taiyo.moe>`, with an HTML body and a plain text one derived from it. Production requires `SES_ACCESS_KEY_ID` and `SES_SECRET_ACCESS_KEY`. Elsewhere, without them, each email is written as a JSON file (`to`, `subject`, plain `text`) to `taiyo-emails/` in the system temp directory (`/tmp/taiyo-emails` on Linux), so you can open the links it holds; the end-to-end tests read them there.

Run `pnpm -F @taiyomoe/emails email:preview` to preview the templates.
