import { m } from "@/paraglide/messages"

/**
 * Placeholder catalogue for the marketing page. Title and author names are
 * invented and stay literal — they are sample data, not UI copy, so they are
 * not translated. Everything the reader is actually being told goes through
 * paraglide.
 */
export type LandingTitle = {
  id: string
  title: string
  author: string
  rating: number
  chapters: number
  tag: string
}

export const TITLES: LandingTitle[] = [
  {
    id: "ramen",
    title: "Midnight Ramen Club",
    author: "Yu Abe",
    rating: 4.8,
    chapters: 205,
    tag: "Comedy",
  },
  {
    id: "solar",
    title: "Solar Drift",
    author: "Aiko Tanaka",
    rating: 4.6,
    chapters: 142,
    tag: "Sci-Fi",
  },
  {
    id: "blade",
    title: "Paper Blade",
    author: "Sora Nakamura",
    rating: 4.5,
    chapters: 96,
    tag: "Action",
  },
  {
    id: "tide",
    title: "Tidecaller",
    author: "Mika Hoshino",
    rating: 4.4,
    chapters: 117,
    tag: "Fantasy",
  },
  {
    id: "garden",
    title: "The Glass Garden",
    author: "Emi Fujimoto",
    rating: 4.3,
    chapters: 53,
    tag: "Mystery",
  },
  {
    id: "hanabira",
    title: "Hanabira no Yoru",
    author: "Ren Sato",
    rating: 4.2,
    chapters: 88,
    tag: "Romance",
  },
  {
    id: "circuit",
    title: "Circuit Hearts",
    author: "Dai Kuroda",
    rating: 4.1,
    chapters: 64,
    tag: "Drama",
  },
  {
    id: "iron",
    title: "Iron Lantern",
    author: "Kenji Mori",
    rating: 3.9,
    chapters: 31,
    tag: "Fantasy",
  },
]

/** One star, deliberately — the joke is that every review is a 1-star rave. */
export const REVIEWS = [
  { quote: m.landing_review_1_quote, who: m.landing_review_1_who, role: m.landing_review_1_role },
  { quote: m.landing_review_2_quote, who: m.landing_review_2_who, role: m.landing_review_2_role },
  { quote: m.landing_review_3_quote, who: m.landing_review_3_who, role: m.landing_review_3_role },
  { quote: m.landing_review_4_quote, who: m.landing_review_4_who, role: m.landing_review_4_role },
  { quote: m.landing_review_5_quote, who: m.landing_review_5_who, role: m.landing_review_5_role },
  { quote: m.landing_review_6_quote, who: m.landing_review_6_who, role: m.landing_review_6_role },
]

export const STATS = [
  { value: "10K+", label: m.landing_stat_titles },
  { value: "20K+", label: m.landing_stat_readers },
  { value: "100%", label: m.landing_stat_free },
]
