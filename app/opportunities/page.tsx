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
      const data = await getOpportunities();

      if (!isMounted) {
        return;
      }

      setOpportunitiesData((data ?? []) as Opportunity[]);
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
      selectedTag === null || opportunity.tags.includes(selectedTag);

    return matchesCategory && matchesSearch && matchesTag;
  });

  // We sort after filtering so the final displayed list is both relevant
  // and ordered by soonest deadline first.
  // Date strings are converted into numeric timestamps for reliable comparison.
  const sortedOpportunities = filteredOpportunities.sort((a, b) => {
    const dateA = new Date(a.deadline).getTime();
    const dateB = new Date(b.deadline).getTime();

    return dateA - dateB;
  });

  return (
    // In Next.js App Router, this file maps to the URL "/opportunities" automatically.
    // Why this exists: this page is the central listing screen where users can discover opportunities.
    // How it fits the site: users arrive from the homepage and then choose a specific opportunity to open.
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-6 py-16 text-center">
      {/*
        This title tells visitors what this route is for.
        We keep it clear and specific so users instantly understand the page purpose.
        This page acts as the main discovery hub for opportunities on BlueLinks.
      */}
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Opportunities Hub
      </h1>

      {/*
        This short description sets expectations about the kinds of listings users will find.
        It helps first-time visitors understand the value of the page before real data is loaded.
      */}
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-700">
        Discover internships, fellowships, scholarships and jobs in
        conservation, climate and ocean careers.
      </p>

      {/*
        We import the opportunities array from lib/opportunities.ts at the top.
        That shared dataset powers this list page and also the dynamic details page,
        so both pages stay in sync.
      */}
      <section className="mt-8 flex w-full flex-wrap items-center justify-center gap-2">
        {categoryFilters.map((filter) => {
          const isActive = selectedCategory === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedCategory(filter)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sky-700 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </section>

      <section className="mt-4 w-full">
        <label htmlFor="opportunity-search" className="sr-only">
          Search opportunities
        </label>
        <input
          id="opportunity-search"
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by title, organisation, or description"
          className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </section>

      {selectedTag && (
        <section className="mt-4 flex w-full items-center justify-between rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-left">
          <p className="text-sm text-sky-900">
            Active tag filter: <span className="font-semibold">{selectedTag}</span>
          </p>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-sky-800 ring-1 ring-sky-300 hover:bg-sky-100"
          >
            Clear tag
          </button>
        </section>
      )}

      <section className="mt-6 grid w-full gap-4 text-left">
        {/*
          We use map() after filtering.
          First we build filteredOpportunities, then map() turns each item into a card.
          This two-step pattern (filter, then map) is a core approach for discovery UIs.
        */}
        {sortedOpportunities.map((opportunity) => {
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
                ? "rounded-xl border border-slate-300 bg-slate-50 p-6 opacity-80 shadow-sm transition"
                : deadlineStatus === "closingSoon"
                  ? "rounded-xl border border-amber-300 bg-amber-50/40 p-6 shadow-sm transition hover:border-amber-400 hover:shadow-md"
                  : "rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-300 hover:shadow-md";

            const deadlineBlockClassName =
              deadlineStatus === "closed"
                ? "space-y-2 rounded-lg bg-slate-100 px-3 py-2"
                : deadlineStatus === "closingSoon"
                  ? "space-y-2 rounded-lg bg-amber-100/70 px-3 py-2"
                  : "space-y-2 rounded-lg bg-slate-50 px-3 py-2";

          let closingStatusLabel = "";
          let closingStatusClassName =
            "inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700";

            if (deadlineStatus === "closed") {
            closingStatusLabel = "Closed";
            closingStatusClassName =
              "inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700";
            } else if (daysUntilDeadline === 0 || daysUntilDeadline === 1) {
            closingStatusLabel = "Closes tomorrow";
            closingStatusClassName =
              "inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700";
            } else if (deadlineStatus === "closingSoon") {
            closingStatusLabel = "Closing soon";
            closingStatusClassName =
              "inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800";
          } else {
            closingStatusLabel = `Closing in ${daysUntilDeadline} days`;
          }

          return (
            // Card layout structure:
            // Top: title, category, organisation, and location for quick scanning.
            // Middle: short description preview.
            // Bottom: highlighted deadline and a clear action button.
              <article key={opportunity.slug} className={cardClassName}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">
                  {opportunity.title}
                </h2>
                <p className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-800">
                  {opportunity.category}
                </p>
              </div>

              <p className="mt-2 text-slate-700">{opportunity.organisation}</p>
              <p className="mt-1 text-slate-600">{opportunity.location}</p>

              <p className="mt-4 leading-relaxed text-slate-700">{shortDescription}</p>

              {/*
                map() loops through the tags array and returns one pill element per tag.
                React renders this list efficiently when each item has a stable key.
                Tags improve discovery because users can quickly scan themes like
                "Marine", "Policy", or "Fieldwork" before opening details.
              */}
              <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.tags.map((tag) => (
                  <button
                    type="button"
                    key={`${opportunity.slug}-${tag}`}
                    onClick={() =>
                      setSelectedTag((previous) =>
                        previous === tag ? null : tag,
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selectedTag === tag
                        ? "bg-sky-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
                {/*
                  The deadline date is primary because users trust the concrete date most.
                  The urgency label is secondary context (helpful, but not more important
                  than the real deadline).
                  Highlighting urgent opportunities improves usability because people
                  can quickly scan which cards need immediate action.
                */}
                <div className={deadlineBlockClassName}>
                  <p className="text-base font-semibold text-slate-900">
                    Deadline: {formattedDeadline}
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
                  className="inline-flex rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
                >
                  View Details
                </Link>
              </div>
            </article>
          );
        })}

        {!isLoading && sortedOpportunities.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
            No opportunities match your current category and search filters.
          </p>
        )}

        {isLoading && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
            Loading opportunities from the database...
          </p>
        )}
      </section>
    </main>
  );
}
