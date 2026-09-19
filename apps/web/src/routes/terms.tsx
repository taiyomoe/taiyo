import { createFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import * as stylex from "@stylexjs/stylex"

import { LegalContact, LegalPage, prose } from "@/components/legal/legal-page"
import { env } from "@/env/client"

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Taiyō" },
      { name: "description", content: "The rules for using Taiyō." },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const support = env.VITE_SUPPORT_EMAIL

  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="19 September 2026"
      intro="These terms are the agreement between you and Taiyō. They cover what you can expect from us, what we expect from you, and what happens when something goes wrong. Please read them before creating an account."
      sections={[
        {
          id: "acceptance",
          heading: "1. Accepting these terms",
          body: (
            <>
              <p sx={prose.p}>
                By creating an account, or by otherwise accessing or using Taiyō (the
                &ldquo;Service&rdquo;), you agree to these Terms of Service. If you do not agree, do
                not use the Service.
              </p>
              <p sx={prose.p}>
                If you use the Service on behalf of an organisation, you confirm that you are
                authorised to accept these terms for that organisation, and &ldquo;you&rdquo; refers
                to it as well as to you personally.
              </p>
            </>
          ),
        },
        {
          id: "eligibility",
          heading: "2. Who may use the Service",
          body: (
            <>
              <p sx={prose.p}>
                You must be at least 13 years old to use Taiyō. If you are in the European Economic
                Area or the United Kingdom, you must be at least 16, or have the consent of a parent
                or guardian.
              </p>
              <p sx={prose.p}>
                You may not use the Service if you have previously been permanently suspended from
                it, or if applicable law bars you from doing so.
              </p>
            </>
          ),
        },
        {
          id: "accounts",
          heading: "3. Your account",
          body: (
            <>
              <p sx={prose.p}>
                You are responsible for the accuracy of the information on your account and for
                everything that happens under it. Keep your credentials to yourself, and tell us
                promptly at{" "}
                <a href={`mailto:${support}`} sx={prose.a}>
                  {support}
                </a>{" "}
                if you believe your account has been accessed without your permission.
              </p>
              <p sx={prose.p}>
                You may close your account at any time. We may retain some information after closure
                where we are required or permitted to do so — see the{" "}
                <Link to="/privacy" {...stylex.props(prose.a)}>
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          id: "acceptable-use",
          heading: "4. Acceptable use",
          body: (
            <>
              <p sx={prose.p}>While using Taiyō, you agree not to:</p>
              <ul sx={prose.ul}>
                <li>
                  upload, post or share content you do not have the right to share, including
                  material that infringes someone else&rsquo;s copyright or trademark;
                </li>
                <li>
                  post content that is unlawful, harassing, hateful, defamatory, or sexually
                  exploitative of minors;
                </li>
                <li>
                  impersonate another person, or misrepresent your affiliation with a person or
                  organisation;
                </li>
                <li>
                  scrape, crawl, or use automated means to access the Service in a way that degrades
                  it for others, or that circumvents rate limits or access controls;
                </li>
                <li>
                  probe, scan, or test the vulnerability of the Service, or breach any security or
                  authentication measure, other than through a disclosure we have invited;
                </li>
                <li>resell, sublicense, or commercially exploit any part of the Service.</li>
              </ul>
            </>
          ),
        },
        {
          id: "your-content",
          heading: "5. Content you submit",
          body: (
            <>
              <p sx={prose.p}>
                You keep ownership of everything you upload. By submitting content, you grant us a
                worldwide, non-exclusive, royalty-free licence to host, store, reproduce, adapt for
                technical purposes such as resizing, and display that content, solely so that we can
                operate and improve the Service. This licence ends when you delete the content,
                except for copies retained in backups for a limited period.
              </p>
              <p sx={prose.p}>
                You confirm that you have the rights necessary to grant that licence, and that your
                content does not infringe anyone else&rsquo;s rights.
              </p>
            </>
          ),
        },
        {
          id: "third-party-rights",
          heading: "6. Copyright and third-party material",
          body: (
            <>
              <p sx={prose.p}>
                Taiyō respects the rights of creators and publishers. We respond to properly
                submitted copyright complaints and terminate the accounts of repeat infringers.
              </p>
              <p sx={prose.p}>
                If you believe material on Taiyō infringes your copyright, follow the process on our{" "}
                <Link to="/dmca" {...stylex.props(prose.a)}>
                  Copyright &amp; DMCA
                </Link>{" "}
                page.
              </p>
            </>
          ),
        },
        {
          id: "moderation",
          heading: "7. Moderation and enforcement",
          body: (
            <>
              <p sx={prose.p}>
                We may remove content, and suspend or terminate accounts, where we reasonably
                believe these terms have been broken, where we are required to by law, or where
                leaving the content up would expose users or Taiyō to material risk.
              </p>
              <p sx={prose.p}>
                Where it is reasonable and lawful to do so, we will tell you why, and you may reply
                to us at{" "}
                <a href={`mailto:${support}`} sx={prose.a}>
                  {support}
                </a>{" "}
                to contest the decision.
              </p>
            </>
          ),
        },
        {
          id: "availability",
          heading: "8. Availability and changes",
          body: (
            <p sx={prose.p}>
              We are building Taiyō in the open, and parts of it will break, change, or disappear.
              We do not promise any particular level of availability, and we may add, change, or
              remove features at any time. Where a change materially reduces functionality you rely
              on, we will give reasonable notice where we practically can.
            </p>
          ),
        },
        {
          id: "disclaimers",
          heading: "9. Disclaimers",
          body: (
            <p sx={prose.p}>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
              warranties of any kind, whether express or implied, including any implied warranties
              of merchantability, fitness for a particular purpose, and non-infringement. Some
              jurisdictions do not allow the exclusion of implied warranties, in which case this
              section applies to the fullest extent permitted by law.
            </p>
          ),
        },
        {
          id: "liability",
          heading: "10. Limitation of liability",
          body: (
            <>
              <p sx={prose.p}>
                To the fullest extent permitted by law, Taiyō and the people who work on it will not
                be liable for any indirect, incidental, special, consequential, or punitive damages,
                nor for any loss of profits, data, goodwill, or content, arising out of your use of
                the Service.
              </p>
              <p sx={prose.p}>
                Nothing in these terms excludes or limits liability for death or personal injury
                caused by negligence, for fraud or fraudulent misrepresentation, or for anything
                else that cannot lawfully be excluded.
              </p>
            </>
          ),
        },
        {
          id: "indemnity",
          heading: "11. Indemnity",
          body: (
            <p sx={prose.p}>
              You agree to indemnify and hold harmless Taiyō and the people who work on it against
              any claim, demand, loss, or expense, including reasonable legal fees, arising out of
              content you submit or your breach of these terms. This does not apply to the extent
              the claim arises from our own breach or negligence.
            </p>
          ),
        },
        {
          id: "governing-law",
          heading: "12. Governing law",
          body: (
            <p sx={prose.p}>
              These terms are governed by the laws of the jurisdiction in which the operator of
              Taiyō is established, without regard to its conflict-of-laws rules. If you are a
              consumer, you keep the benefit of any mandatory protections of the law of your country
              of residence, and you may bring proceedings in its courts.
            </p>
          ),
        },
        {
          id: "changes",
          heading: "13. Changes to these terms",
          body: (
            <p sx={prose.p}>
              We may update these terms as the Service develops. When we make a material change we
              will update the date at the top of this page and, where the change significantly
              affects your rights, give notice in the product or by email before it takes effect.
              Continuing to use Taiyō after a change takes effect means you accept the revised
              terms.
            </p>
          ),
        },
        {
          id: "contact",
          heading: "14. Contact",
          body: (
            <LegalContact>
              <p sx={prose.p}>
                Questions about these terms, or about a moderation decision, go to{" "}
                <a href={`mailto:${support}`} sx={prose.a}>
                  {support}
                </a>
                . Copyright complaints follow the separate process on the{" "}
                <Link to="/dmca" {...stylex.props(prose.a)}>
                  Copyright &amp; DMCA
                </Link>{" "}
                page.
              </p>
            </LegalContact>
          ),
        },
      ]}
    />
  )
}
