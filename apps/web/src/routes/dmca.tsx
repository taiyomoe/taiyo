import * as stylex from "@stylexjs/stylex"
import { Link, createFileRoute } from "@tanstack/react-router"

import { LegalContact, LegalPage, prose } from "@/components/legal/legal-page"
import { env } from "@/env/client"

export const Route = createFileRoute("/dmca")({
  head: () => ({
    meta: [
      { title: "Copyright & DMCA — Taiyō" },
      {
        name: "description",
        content: "How to report copyright infringement on Taiyō, and how to counter a notice.",
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const support = env.VITE_SUPPORT_EMAIL

  return (
    <LegalPage
      eyebrow="Legal"
      title="Copyright & DMCA"
      updated="19 September 2026"
      intro={
        <>
          Taiyō responds to copyright complaints. Send every notice, and every counter-notice, by
          email to{" "}
          <a href={`mailto:${support}`} sx={prose.a}>
            {support}
          </a>
          . We do not accept notices by any other channel.
        </>
      }
      sections={[
        {
          id: "overview",
          heading: "1. Overview",
          body: (
            <>
              <p sx={prose.p}>
                We remove or disable access to material that is properly reported as infringing, and
                we terminate the accounts of users who infringe repeatedly. This page sets out how
                to report material, how a user can contest a removal, and what we do in between.
              </p>
              <p sx={prose.p}>
                All correspondence goes to{" "}
                <a href={`mailto:${support}`} sx={prose.a}>
                  {support}
                </a>
                . Please put <code sx={prose.code}>Copyright notice</code> or{" "}
                <code sx={prose.code}>Counter-notice</code> in the subject line so it reaches the
                right queue.
              </p>
            </>
          ),
        },
        {
          id: "notice",
          heading: "2. Sending a copyright notice",
          body: (
            <>
              <p sx={prose.p}>
                To be effective, a notice must be in writing and include all of the following. These
                are the elements required by 17 U.S.C. § 512(c)(3); an incomplete notice may delay
                or prevent us acting on it.
              </p>
              <ul sx={prose.ul}>
                <li>
                  your physical or electronic signature, as the owner of an exclusive right or as a
                  person authorised to act on the owner&rsquo;s behalf;
                </li>
                <li>
                  identification of the copyrighted work you say has been infringed — or, if the
                  notice covers many works on Taiyō, a representative list of them;
                </li>
                <li>
                  identification of the material you say is infringing, with enough detail for us to
                  locate it. <strong sx={prose.strong}>Direct URLs are essential;</strong> a title
                  alone is not enough;
                </li>
                <li>
                  your contact details: name, postal address, telephone number, and email address;
                </li>
                <li>
                  a statement that you have a good-faith belief that the use complained of is not
                  authorised by the copyright owner, its agent, or the law;
                </li>
                <li>
                  a statement that the information in the notice is accurate and — under penalty of
                  perjury — that you are authorised to act on behalf of the owner of the exclusive
                  right.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "what-happens",
          heading: "3. What happens next",
          body: (
            <>
              <p sx={prose.p}>
                We acknowledge notices as we receive them and aim to act on complete ones promptly.
                Where a notice is effective we remove or disable access to the material and record a
                strike against the account that posted it.
              </p>
              <p sx={prose.p}>
                We tell the affected user what was removed and pass on your notice, including your
                name and the contents of the notice, so that they can decide whether to respond.
                Consider using a role address rather than a personal one if that concerns you.
              </p>
            </>
          ),
        },
        {
          id: "counter-notice",
          heading: "4. Sending a counter-notice",
          body: (
            <>
              <p sx={prose.p}>
                If your material was removed and you believe that was a mistake, or that you hold
                the rights, you may send a counter-notice. Under 17 U.S.C. § 512(g)(3) it must
                include:
              </p>
              <ul sx={prose.ul}>
                <li>your physical or electronic signature;</li>
                <li>
                  identification of the material that was removed, and the location where it
                  appeared before removal;
                </li>
                <li>
                  a statement, under penalty of perjury, that you have a good-faith belief the
                  material was removed as a result of mistake or misidentification;
                </li>
                <li>
                  your name, address, and telephone number, and a statement that you consent to the
                  jurisdiction of the federal district court for the district in which you live, or,
                  if you live outside the United States, of any district in which Taiyō may be
                  found, and that you will accept service of process from the person who filed the
                  notice.
                </li>
              </ul>
              <p sx={prose.p}>
                We forward a valid counter-notice to the original complainant. If they do not tell
                us within 10 to 14 business days that they have filed an action seeking a court
                order, we may restore the material.
              </p>
            </>
          ),
        },
        {
          id: "repeat-infringers",
          heading: "5. Repeat infringers",
          body: (
            <p sx={prose.p}>
              Accounts that accumulate repeated, unrebutted copyright strikes are terminated, and we
              may refuse service to the same person under a new account. Evading a termination is a
              breach of our{" "}
              <Link to="/terms" {...stylex.props(prose.a)}>
                Terms of Service
              </Link>
              .
            </p>
          ),
        },
        {
          id: "misrepresentation",
          heading: "6. A warning about false claims",
          body: (
            <p sx={prose.p}>
              Under 17 U.S.C. § 512(f), anyone who knowingly makes a material misrepresentation —
              that material is infringing, or that it was removed by mistake — may be liable for
              damages, including costs and legal fees. If you are not certain whether the use is
              infringing, take advice before filing. We are not able to give you legal advice.
            </p>
          ),
        },
        {
          id: "contact",
          heading: "7. Where to send it",
          body: (
            <LegalContact>
              <p sx={prose.p}>
                Copyright notices and counter-notices:{" "}
                <a href={`mailto:${support}`} sx={prose.a}>
                  {support}
                </a>
              </p>
              <p sx={prose.p}>
                Everything else — privacy requests, moderation appeals, general support — goes to
                the same address, but please say which it is in the subject line.
              </p>
            </LegalContact>
          ),
        },
      ]}
    />
  )
}
