"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getOpportunities } from "../../lib/getOpportunities";
import { type Opportunity } from "../../lib/opportunities";

type CategoryFilter = "All" | "Internship" | "Fellowship" | "Scholarship";

const categoryFilters: CategoryFilter[] = [
  "All",
  "Internship",
  "Fellowship",
  "Scholarship",
];

export default function OpportunitiesPage() {
  // This page stays a client component because search/category/tag filters use
  // interactive React state that updates immediately in the browser.
  // To keep that behavior, we fetch database data after the page mounts.

  // React state is a value that React remembers between renders.
  // When this state changes, React updates the UI automatically.
  // Here, selectedCategory stores which filter button the user clicked.
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");

  // This second piece of React state stores whatever the user types
  // into the search bar. Every keypress updates this value.
  const [searchQuery, setSearchQuery] = useState("");

  // This state stores the currently selected tag filter.
  // When null, no tag filter is active.
  // When set (for example "Marine"), we only show opportunities with that tag.
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // This state holds opportunities loaded from Supabase.
  // It replaces the old hardcoded import array as the source of truth.
  const [opportunitiesData, setOpportunitiesData] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // We fetch database rows before rendering the final list.
  // In a client component, this is done in useEffect with an async function.
  // Once data arrives, we store it in state so filters/search/tag logic can run
  // against live database records.
  useEffect(() => {
    let isMounted = true;

    const loadOpportunities = async () => {
      const opportunities = await getOpportunities();
      console.log(opportunities);

      if (!isMounted) {
        return;
      }

      setOpportunitiesData((opportunities ?? []) as Opportunity[]);
      setIsLoading(false);
    };

    void loadOpportunities();

    return () => {
      isMounted = false;
    };
  }, []);

  // This creates a new list before we render cards.
  // Filter logic:
  // 1) Check category: if "All" is selected, pass everything, otherwise match category.
  // 2) Check text search: compare the lowercase query to title, organisation, and description.
  // 3) Check tag filter: if selectedTag is set, the opportunity must include that tag.
  // 4) Keep only opportunities that pass all checks.
  // Filtering data before map() is common in web apps because it keeps rendering simple:
  // we prepare the exact data first, then map() only renders what should be visible.
  // Search + category + tag filtering is a common discovery-platform pattern because
  // users can narrow large datasets quickly by combining multiple criteria.
  const filteredOpportunities = opportunitiesData.filter((opportunity) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesCategory =
      selectedCategory === "All" || opportunity.category === selectedCategory;

    const matchesSearch =
      normalizedQuery === "" ||
      opportunity.title.toLowerCase().includes(normalizedQuery) ||
      opportunity.organisation.toLowerCase().includes(normalizedQuery) ||
      opportunity.description.toLowerCase().includes(normalizedQuery);

    // includes() checks whether the selected tag exists inside the
    // opportunity.tags array.
    // If no tag is selected, every opportunity passes this check.
    const matchesTag =
      selectedTag === null || (opportunity.tags ?? []).includes(selectedTag);

    return matchesCategory && matchesSearch && matchesTag;
  });

  // We sort after filtering so the final displayed list is both relevant
  // and ordered by soonest deadline first.
  // Date strings are converted into numeric timestamps for reliable comparison.
  const sortedOpportunities = filteredOpportunities.sort((a, b) => {
    const dateA = a.deadline
      ? new Date(a.deadline).getTime()
      : Number.POSITIVE_INFINITY;
    const dateB = b.deadline
      ? new Date(b.deadline).getTime()
      : Number.POSITIVE_INFINITY;

    return dateA - dateB;
  });

  return (
    // In Next.js App Router, this file maps to the URL "/opportunities" automatically.
    // Why this exists: this page is the central listing screen where users can discover opportunities.
    // How it fits the site: users arrive from the homepage and then choose a specific opportunity to open.
    <main className="opps-page relative isolate mx-auto min-h-screen w-full max-w-none overflow-hidden bg-[radial-gradient(1200px_500px_at_8%_-5%,rgba(14,165,233,0.2),transparent_65%),radial-gradient(900px_420px_at_95%_8%,rgba(20,184,166,0.18),transparent_62%),linear-gradient(to_bottom,#e8f3f5,#dff0ef_40%,#d7ece9_72%,#d4e8e7)] px-5 py-12 text-left sm:px-8 sm:py-14 lg:px-12 xl:px-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-35 [background-image:linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:36px_36px]"
      />
      <div aria-hidden className="opps-orb opps-orb-a" />
      <div aria-hidden className="opps-orb opps-orb-b" />
      <div aria-hidden className="opps-orb opps-orb-c" />
      {/*
        This title tells visitors what this route is for.
        We keep it clear and specific so users instantly understand the page purpose.
        This page acts as the main discovery hub for opportunities on BlueLinks.
      */}
      <section className="relative overflow-hidden rounded-3xl border border-white/75 bg-gradient-to-br from-slate-900/88 via-slate-900/82 to-cyan-900/70 px-6 py-10 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur-sm sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gradient-to-br from-sky-300/40 to-cyan-200/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 left-14 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-300/35 to-teal-200/10 blur-2xl"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90">
          BlueLinks Platform
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Opportunities Hub
        </h1>

      {/*
        This short description sets expectations about the kinds of listings users will find.
        It helps first-time visitors understand the value of the page before real data is loaded.
      */}
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg">
          Discover internships, fellowships, scholarships and jobs in
          conservation, climate and ocean careers.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <span className="rounded-full border border-cyan-300/30 bg-cyan-900/35 px-3 py-1.5 text-xs font-semibold tracking-wide text-cyan-100">
            {sortedOpportunities.length} visible now
          </span>
          <span className="rounded-full border border-emerald-300/30 bg-emerald-900/30 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-100">
            Live from database
          </span>
          <span className="rounded-full border border-slate-400/35 bg-slate-900/45 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-200">
            Updated in real time
          </span>
        </div>
      </section>

      {/*
        We import the opportunities array from lib/opportunities.ts at the top.
        That shared dataset powers this list page and also the dynamic details page,
        so both pages stay in sync.
      */}
      {/*
        Controls are grouped in one surface so filters feel like a single designed system.
      */}
      <section className="mt-8 rounded-2xl border border-teal-200/45 bg-gradient-to-br from-white/88 via-teal-50/72 to-cyan-50/66 p-4 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur sm:p-5">
      <section className="flex w-full flex-wrap items-center gap-2">
        {categoryFilters.map((filter) => {
          const isActive = selectedCategory === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedCategory(filter)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "border-sky-700 bg-gradient-to-r from-sky-700 to-cyan-700 text-white shadow-[0_8px_20px_-10px_rgba(2,132,199,0.8)]"
                  : "border-slate-300 bg-white/90 text-slate-700 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-white"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </section>

      <section className="mt-3 w-full">
        <label htmlFor="opportunity-search" className="sr-only">
          Search opportunities
        </label>
        <input
          id="opportunity-search"
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by title, organisation, or description"
          className="w-full rounded-xl border border-teal-200/80 bg-white/92 px-4 py-3 text-slate-900 placeholder:text-slate-500 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        />
      </section>
      </section>

      {selectedTag && (
        <section className="mt-4 flex w-full items-center justify-between rounded-xl border border-cyan-300/45 bg-gradient-to-r from-cyan-50/95 to-teal-50/90 px-4 py-3 text-left">
          <p className="text-sm text-cyan-900">
            Active tag filter: <span className="font-semibold">{selectedTag}</span>
          </p>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className="rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-cyan-900 ring-1 ring-cyan-300/60 hover:bg-white"
          >
            Clear tag
          </button>
        </section>
      )}

      <section className="mt-8 grid w-full grid-cols-1 gap-6 text-left lg:grid-cols-2">
        {/*
          We use map() after filtering.
          First we build filteredOpportunities, then map() turns each item into a card.
          This two-step pattern (filter, then map) is a core approach for discovery UIs.
        */}
        {sortedOpportunities.map((opportunity, index) => {
          // substring(0, 120) keeps only the first 120 characters for a compact card preview.
          // We add "..." only when the original text is longer than 120 characters.
          const shortDescription =
            opportunity.description.length > 120
              ? `${opportunity.description.substring(0, 120)}...`
              : opportunity.description;

          // JavaScript Date objects represent points in time.
          // We convert the deadline string (YYYY-MM-DD) into a Date so we can
          // compare it with "now" and measure how much time is left.
          const today = new Date();
          const deadlineDate = new Date(opportunity.deadline);

          // getTime() returns milliseconds since Jan 1, 1970.
          // Subtracting two timestamps gives a millisecond difference.
          const millisecondsUntilDeadline =
            deadlineDate.getTime() - today.getTime();

          // Convert milliseconds to days.
          // Math.ceil rounds upward so even partial days count as 1 day remaining.
          // Example: 1.2 days becomes 2 days, which helps communicate urgency.
          const daysUntilDeadline = Math.ceil(
            millisecondsUntilDeadline / (1000 * 60 * 60 * 24),
          );

          const formattedDeadline = deadlineDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

            // We compare the deadline against today's date to classify urgency.
            // This gives each card a simple status that drives both labels and styling.
            // - closed: deadline has passed
            // - closingSoon: deadline is within 14 days
            // - open: deadline is farther away
            let deadlineStatus: "closed" | "closingSoon" | "open" = "open";

            if (daysUntilDeadline < 0) {
              deadlineStatus = "closed";
            } else if (daysUntilDeadline <= 14) {
              deadlineStatus = "closingSoon";
            }

            // Conditional class names let us switch styles based on state.
            // This is a common React pattern: compute state first, then map it to
            // visual classes in the JSX.
            const cardClassName =
              deadlineStatus === "closed"
                ? "overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-100 to-slate-50 shadow-lg shadow-slate-300/35 transition"
                : deadlineStatus === "closingSoon"
                  ? "overflow-hidden rounded-2xl border border-amber-300/70 bg-gradient-to-br from-white to-amber-50/70 shadow-lg shadow-amber-200/35 transition hover:border-amber-300 hover:shadow-xl"
                  : "overflow-hidden rounded-2xl border border-cyan-200/70 bg-gradient-to-br from-white to-cyan-50/55 shadow-lg shadow-cyan-200/35 transition hover:-translate-y-0.5 hover:border-cyan-300/70 hover:shadow-xl";

            const deadlineBlockClassName =
              deadlineStatus === "closed"
                ? "min-w-[220px] space-y-2 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2.5 sm:min-w-[250px]"
                : deadlineStatus === "closingSoon"
                  ? "min-w-[220px] space-y-2 rounded-xl border border-amber-300/70 bg-amber-50/80 px-3.5 py-2.5 sm:min-w-[250px]"
                  : "min-w-[220px] space-y-2 rounded-xl border border-cyan-200/80 bg-cyan-50/80 px-3.5 py-2.5 sm:min-w-[250px]";

          let closingStatusLabel = "";
          let closingStatusClassName =
            "inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-900";

            if (deadlineStatus === "closed") {
            closingStatusLabel = "Closed";
            closingStatusClassName =
              "inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700";
            } else if (daysUntilDeadline === 0 || daysUntilDeadline === 1) {
            closingStatusLabel = "Closes tomorrow";
            closingStatusClassName =
              "inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800";
            } else if (deadlineStatus === "closingSoon") {
            closingStatusLabel = "Closing soon";
            closingStatusClassName =
              "inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800";
          } else {
            closingStatusLabel = `Closing in ${daysUntilDeadline} days`;
          }

          return (
            // Card layout structure:
            // Top: title, category, organisation, and location for quick scanning.
            // Middle: short description preview.
            // Bottom: highlighted deadline and a clear action button.
              <article
                key={opportunity.slug}
                className={`${cardClassName} opps-card-reveal`}
                style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
              >
              {opportunity.image_url ? (
                <div className="relative h-40 w-full rounded-t-2xl">
                  <img
                    src={opportunity.image_url}
                    alt={opportunity.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-slate-900/20 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.3),transparent_35%)]" />
                </div>
              ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-t-2xl bg-gradient-to-br from-slate-200 to-slate-300/85 text-sm font-medium tracking-wide text-slate-700">
                  no image yet
                </div>
              )}

              <div className="space-y-5 p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-[1.7rem]">
                  {opportunity.title}
                </h2>
                <p className="inline-flex rounded-full border border-cyan-300/70 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  {opportunity.category}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">{opportunity.organisation}</p>
                <p className="text-sm font-medium text-slate-700">{opportunity.location}</p>
              </div>

              <p className="text-sm leading-7 text-slate-700">{shortDescription}</p>

              {/*
                map() loops through the tags array and returns one pill element per tag.
                React renders this list efficiently when each item has a stable key.
                Tags improve discovery because users can quickly scan themes like
                "Marine", "Policy", or "Fieldwork" before opening details.
              */}
              <div className="flex flex-wrap gap-2">
                {(opportunity.tags ?? []).map((tag) => (
                  <button
                    type="button"
                    key={`${opportunity.slug}-${tag}`}
                    onClick={() =>
                      setSelectedTag((previous) =>
                        previous === tag ? null : tag,
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      selectedTag === tag
                        ? "border-sky-700 bg-sky-700 text-white"
                        : "border-slate-200 bg-white/90 text-slate-700 hover:border-cyan-300/60 hover:bg-cyan-50/50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/*
                Visual hierarchy matters: users should see the exact deadline date first,
                then supporting urgency text second.
                We place them in a left-side info block and keep the action button on the
                right side to avoid crowding.
              */}
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-200/80 pt-5">
                {/*
                  The deadline date is primary because users trust the concrete date most.
                  The urgency label is secondary context (helpful, but not more important
                  than the real deadline).
                  Highlighting urgent opportunities improves usability because people
                  can quickly scan which cards need immediate action.
                */}
                <div className={deadlineBlockClassName}>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Deadline
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {formattedDeadline}
                  </p>
                  <p className={closingStatusClassName}>{closingStatusLabel}</p>
                </div>

                {/*
                  Flexbox creates breathing room by pushing the button to the right,
                  so deadline details and actions are clearly separated zones.
                  This link uses the slug to navigate to a dynamic details route.
                  Example: /opportunities/blue-economy-fellowship maps to
                  app/opportunities/[slug]/page.tsx in the App Router.
                */}
                <Link
                  href={`/opportunities/${opportunity.slug}`}
                  className="inline-flex rounded-lg bg-gradient-to-r from-slate-900 to-cyan-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-cyan-700"
                >
                  View Details
                </Link>
              </div>
              </div>
            </article>
          );
        })}

        {!isLoading && sortedOpportunities.length === 0 && (
          <p className="rounded-2xl border border-dashed border-cyan-200/70 bg-white/85 p-6 text-slate-700 shadow-lg shadow-cyan-200/25">
            No opportunities match your current category and search filters.
          </p>
        )}

        {isLoading && (
          <p className="rounded-2xl border border-dashed border-cyan-200/70 bg-white/85 p-6 text-slate-700 shadow-lg shadow-cyan-200/25">
            Loading opportunities from the database...
          </p>
        )}
      </section>
    </main>
  );
}
