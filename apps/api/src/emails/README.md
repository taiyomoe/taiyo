# Emails

The react-email templates the API sends through Amazon SES.

- `send-auth-email.tsx` renders the emails Better Auth asks for. `createAuth` takes it as `sendEmail`, so `@taiyomoe/auth` holds no templates.
- `send-group-invitation-email.tsx` sends group invitations, through `services.mailer`.

`sendEmail` in `client.ts` sends from `Taiyō <no-reply@taiyo.moe>`, with an HTML body and a plain text one derived from it. Without `SES_ACCESS_KEY_ID` and `SES_SECRET_ACCESS_KEY` it sends nothing; production requires both.

Run `pnpm -F @taiyomoe/api email:preview` to preview the templates.
