# `@taiyomoe/email`

This package renders the react-email templates and sends them through Amazon SES.

## Usage

```tsx
import { MagicLinkEmail, sendEmail } from "@taiyomoe/email"

await sendEmail({
  to: user.email,
  subject: "Your magic link for Taiyō",
  react: <MagicLinkEmail name={user.name} url={magicLink} />,
})
```

`sendEmail` sends from `Taiyō <no-reply@taiyo.moe>`, with an HTML body and a plain text one derived from it. Without `SES_ACCESS_KEY_ID` and `SES_SECRET_ACCESS_KEY` it sends nothing; production requires both.

Run `pnpm start` to preview the templates.
