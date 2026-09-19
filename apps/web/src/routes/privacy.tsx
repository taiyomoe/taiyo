import * as stylex from "@stylexjs/stylex"
import { Link, createFileRoute } from "@tanstack/react-router"

import { LegalContact, LegalPage, prose } from "@/components/legal/legal-page"
import { env } from "@/env/client"

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Taiyō" },
      { name: "description", content: "What Taiyō collects, why, and what you can do about it." },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const support = env.VITE_SUPPORT_EMAIL

  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="19 September 2026"
      intro="This policy explains what Taiyō collects, why we collect it, who else sees it, and the control you have over it. We have tried to write it in plain language rather than in the shape of a liability shield."
      sections={[
        {
          id: "scope",
          heading: "1. Who this covers",
          body: (
            <>
              <p sx={prose.p}>
                This policy applies to the Taiyō website and to any account you hold with us. It
                does not apply to sites we link to, which have their own policies.
              </p>
              <p sx={prose.p}>
                For the purposes of the UK and EU GDPR, the operator of Taiyō is the data controller
                for the information described here.
              </p>
            </>
          ),
        },
        {
          id: "what-we-collect",
          heading: "2. What we collect",
          body: (
            <>
              <p sx={prose.p}>
                <strong sx={prose.strong}>Account information.</strong> Your display name, email
                address, and a hashed form of your password. We never store your password in a form
                we can read. If you sign in with Google or Discord instead, we receive your email
                address and basic profile information from them, not your password.
              </p>
              <p sx={prose.p}>
                <strong sx={prose.strong}>Content you submit.</strong> Anything you upload or write
                — library entries, reading progress, uploaded pages, comments, and reports.
              </p>
              <p sx={prose.p}>
                <strong sx={prose.strong}>Technical information.</strong> Your IP address, browser
                and device type, and the pages you request, recorded in server logs. We use this to
                keep the Service running, to investigate abuse, and to diagnose faults.
              </p>
              <p sx={prose.p}>
                <strong sx={prose.strong}>Anti-abuse signals.</strong> When you sign up we use
                Cloudflare Turnstile to tell humans from bots. Turnstile receives technical signals
                from your browser; it is designed not to profile you across sites.
              </p>
            </>
          ),
        },
        {
          id: "why",
          heading: "3. Why we use it, and on what basis",
          body: (
            <>
              <ul sx={prose.ul}>
                <li>
                  <strong sx={prose.strong}>To provide the Service</strong> — creating your account,
                  authenticating you, storing your library and reading progress. Legal basis:
                  performance of our contract with you.
                </li>
                <li>
                  <strong sx={prose.strong}>To keep the Service safe</strong> — rate limiting, abuse
                  and fraud prevention, enforcing our{" "}
                  <Link to="/terms" {...stylex.props(prose.a)}>
                    Terms of Service
                  </Link>
                  . Legal basis: our legitimate interest in a service that is not overrun.
                </li>
                <li>
                  <strong sx={prose.strong}>To communicate with you</strong> — verification emails,
                  password resets, and notices about material changes. Legal basis: performance of
                  our contract, and our legitimate interest in keeping you informed.
                </li>
                <li>
                  <strong sx={prose.strong}>To meet legal obligations</strong> — responding to valid
                  legal requests and to copyright notices. Legal basis: compliance with a legal
                  obligation.
                </li>
              </ul>
              <p sx={prose.p}>
                We do not sell your personal information, and we do not use it to build advertising
                profiles.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          heading: "4. Cookies",
          body: (
            <p sx={prose.p}>
              We use a small number of strictly necessary cookies: a session cookie that keeps you
              signed in, and preference cookies that remember things like your theme. These are
              required for the Service to work, so they are not subject to consent. We do not use
              advertising or cross-site tracking cookies.
            </p>
          ),
        },
        {
          id: "sharing",
          heading: "5. Who else sees it",
          body: (
            <>
              <p sx={prose.p}>
                We share personal information only with providers who process it on our
                instructions, under contract, and only as far as they need to:
              </p>
              <ul sx={prose.ul}>
                <li>our hosting and storage providers, who run the servers and store uploads;</li>
                <li>Cloudflare, for network protection and bot detection;</li>
                <li>our transactional email provider, for verification and password-reset mail;</li>
                <li>Google and Discord, if and only if you choose to sign in with one of them.</li>
              </ul>
              <p sx={prose.p}>
                We may also disclose information where we are legally required to, or where it is
                necessary to establish or defend legal claims. If Taiyō is ever transferred to
                another operator, information would move with it, and we would tell you first.
              </p>
            </>
          ),
        },
        {
          id: "transfers",
          heading: "6. International transfers",
          body: (
            <p sx={prose.p}>
              Some of our providers operate outside your country. Where personal information leaves
              the UK or the EEA, we rely on an adequacy decision or on the UK Addendum and the EU
              Standard Contractual Clauses, together with additional safeguards where they are
              needed.
            </p>
          ),
        },
        {
          id: "retention",
          heading: "7. How long we keep it",
          body: (
            <>
              <p sx={prose.p}>
                We keep account information for as long as your account exists. When you delete your
                account we remove or anonymise your personal information within 30 days, except
                where we must keep something longer — for example, records of copyright notices, or
                information needed to stop a suspended user returning.
              </p>
              <p sx={prose.p}>
                Server logs are kept for a short period, normally no more than 90 days, and then
                deleted. Backups roll off on their own schedule.
              </p>
            </>
          ),
        },
        {
          id: "rights",
          heading: "8. Your rights",
          body: (
            <>
              <p sx={prose.p}>
                Depending on where you live, you have some or all of the following rights over your
                personal information:
              </p>
              <ul sx={prose.ul}>
                <li>to know what we hold, and to get a copy of it;</li>
                <li>to have inaccurate information corrected;</li>
                <li>to have information deleted;</li>
                <li>to restrict or object to how we use it;</li>
                <li>to receive it in a portable format;</li>
                <li>to withdraw consent, where we relied on consent.</li>
              </ul>
              <p sx={prose.p}>
                Write to{" "}
                <a href={`mailto:${support}`} sx={prose.a}>
                  {support}
                </a>{" "}
                and we will respond within one month. You also have the right to complain to your
                local data protection authority; in the UK that is the Information
                Commissioner&rsquo;s Office.
              </p>
            </>
          ),
        },
        {
          id: "security",
          heading: "9. Security",
          body: (
            <p sx={prose.p}>
              Traffic is encrypted in transit, passwords are hashed, and access to production
              systems is limited to the people who need it. No service is perfectly secure, so if we
              discover a breach that is likely to put your rights at risk, we will notify you and
              the relevant regulator as the law requires.
            </p>
          ),
        },
        {
          id: "children",
          heading: "10. Children",
          body: (
            <p sx={prose.p}>
              Taiyō is not directed at children under 13, or under 16 in the EEA and the UK. If we
              learn that we hold personal information about a child below the applicable age, we
              will delete it. If you believe a child has given us information, contact us at{" "}
              <a href={`mailto:${support}`} sx={prose.a}>
                {support}
              </a>
              .
            </p>
          ),
        },
        {
          id: "changes",
          heading: "11. Changes to this policy",
          body: (
            <p sx={prose.p}>
              When this policy changes we update the date at the top of the page. If a change
              materially affects how we use your information, we will give notice in the product or
              by email before it takes effect.
            </p>
          ),
        },
        {
          id: "contact",
          heading: "12. Contact",
          body: (
            <LegalContact>
              <p sx={prose.p}>
                Privacy questions, access requests, and deletion requests all go to{" "}
                <a href={`mailto:${support}`} sx={prose.a}>
                  {support}
                </a>
                .
              </p>
            </LegalContact>
          ),
        },
      ]}
    />
  )
}
