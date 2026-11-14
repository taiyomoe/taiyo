import { m } from "@/paraglide/messages"

export const REASONS = [
  { id: "broken", title: m.landing_flaw_broken_title, body: m.landing_flaw_broken_body },
  { id: "catalog", title: m.landing_flaw_catalog_title, body: m.landing_flaw_catalog_body },
  { id: "rival", title: m.landing_flaw_rival_title, body: m.landing_flaw_rival_body },
  { id: "servers", title: m.landing_flaw_servers_title, body: m.landing_flaw_servers_body },
  { id: "team", title: m.landing_flaw_team_title, body: m.landing_flaw_team_body },
  { id: "app", title: m.landing_flaw_app_title, body: m.landing_flaw_app_body },
]

export const REVIEWS = [
  { quote: m.landing_review_1_quote, who: m.landing_review_1_who, role: m.landing_review_1_role },
  { quote: m.landing_review_2_quote, who: m.landing_review_2_who, role: m.landing_review_2_role },
  { quote: m.landing_review_3_quote, who: m.landing_review_3_who, role: m.landing_review_3_role },
  { quote: m.landing_review_4_quote, who: m.landing_review_4_who, role: m.landing_review_4_role },
  { quote: m.landing_review_5_quote, who: m.landing_review_5_who, role: m.landing_review_5_role },
  { quote: m.landing_review_6_quote, who: m.landing_review_6_who, role: m.landing_review_6_role },
  { quote: m.landing_review_7_quote, who: m.landing_review_7_who, role: m.landing_review_7_role },
  { quote: m.landing_review_8_quote, who: m.landing_review_8_who, role: m.landing_review_8_role },
  { quote: m.landing_review_9_quote, who: m.landing_review_9_who, role: m.landing_review_9_role },
  {
    quote: m.landing_review_10_quote,
    who: m.landing_review_10_who,
    role: m.landing_review_10_role,
  },
]

export const LEGAL_LINKS = [
  { id: "terms", label: m.landing_footer_terms, to: "/terms" },
  { id: "privacy", label: m.landing_footer_privacy, to: "/privacy" },
  { id: "dmca", label: m.landing_footer_content_policy, to: "/dmca" },
] as const
