// A TypeScript "type" is a blueprint for how data should look.
// It does not create data by itself. Instead, it tells TypeScript what fields
// an object must include and what kind of value each field should hold.
// This helps beginners catch mistakes early, such as missing fields or using
// the wrong value type.

// We define the Opportunity structure so every opportunity follows one
// predictable format across the app. This keeps code easier to read, safer to
// refactor, and simpler to scale as more data is added.
export type Opportunity = {
  id: number;
  slug: string;
  title: string;
  organisation: string;
  location: string;
  mode?: string;
  deadline?: string;
  category: string;
  description: string;
  apply_url?: string;
  tags?: string[];

  // NEW FIELDS
  image_url?: string;
  eligibility?: string;
  compensation_type?: string;
};

// A slug is a URL-friendly identifier (usually lowercase with hyphens).
// We use slugs in routes like /opportunities/ics-marine-internship so each
// opportunity can have its own clean, readable page URL.

// This sample array is temporary starter data for development.
// Later, this same structure can come from a database or API.
// The listing page (/opportunities) can map over this array to show cards,
// and the dynamic details page (/opportunities/[slug]) can find one item by
// matching params.slug to opportunity.slug.
export const opportunities: Opportunity[] = [
  {
    id: 1,
    slug: "marine-conservation-internship",
    title: "Marine Conservation Internship",
    organisation: "Island Conservation Society",
    location: "Seychelles",
    deadline: "2026-05-15",
    category: "Internship",
    tags: ["Marine", "Fieldwork", "Seychelles"],
    description: "Support reef monitoring and community outreach.",
    apply_url: "https://example.org/apply",
  },
  {
    id: 2,
    slug: "blue-economy-fellowship",
    title: "Blue Economy Youth Fellowship",
    organisation: "Seychelles Blue Futures Initiative",
    location: "Victoria, Seychelles",
    deadline: "2026-03-10",
    category: "Fellowship",
    tags: ["Blue Economy", "Policy", "Early Career"],
    description:
      "A one-year fellowship for young leaders working on sustainable ocean innovation and policy.",
    apply_url: "https://example.org/opportunities/blue-economy-fellowship",
  },
  {
    id: 3,
    slug: "coastal-resilience-scholarship",
    title: "Coastal Resilience Scholarship",
    organisation: "Indian Ocean Climate Network",
    location: "Hybrid (SIDS region)",
    deadline: "2026-03-01",
    category: "Scholarship",
    tags: ["Climate", "Scholarship", "Fully Funded"],
    description:
      "Funding support for students pursuing studies in climate adaptation and coastal resilience.",
    apply_url: "https://example.org/opportunities/coastal-resilience-scholarship",
  },
];
