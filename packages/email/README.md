# `@taiyomoe/email`

This package provides email functionality using Resend.

## Usage

```ts
import { resend, MagicLinkEmail } from "@taiyomoe/email"

// Send email
await resend.emails.send({
  from: "noreply@example.com",
  to: user.email,
  subject: "Magic Link",
  react: MagicLinkEmail({ url: magicLink }),
})
```
