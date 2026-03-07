import Link from "next/link";

import { opportunities } from "../../../lib/opportunities";

type OpportunityDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OpportunityDetailsPage({
  params,
}: OpportunityDetailsPageProps) {
  // In this Next.js version, params is async, so we await it first.
  // params.slug is the variable part of the URL from this dynamic route.
  // Example: for /opportunities/blue-economy-fellowship, params.slug is
  // "blue-economy-fellowship".
  // Next.js gives us this value automatically because the folder is named [slug].
  const { slug } = await params;

  // find() checks each item in the opportunities array and returns the first
  // one whose slug matches the URL slug.
  // If no match exists, find() returns undefined.
  const opportunity = opportunities.find((item) => item.slug === slug);

  // Slug-based routing is common in content systems (job boards, blogs, docs)
  // because each item can have a human-readable, shareable URL.
  // The list page links to /opportunities/{slug}, and this detail page reads
  // that slug to load one specific record.
  if (!opportunity) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Opportunity not found</h1>
        <p className="mt-3 text-slate-600">
          We could not find an opportunity for this URL slug.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        {opportunity.title}
      </h1>

      <div className="mt-6 space-y-2 text-slate-700">
        <p>
          <span className="font-semibold text-slate-900">Organisation:</span>{" "}
          {opportunity.organisation}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Location:</span>{" "}
          {opportunity.location}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Deadline:</span>{" "}
          {opportunity.deadline}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Category:</span>{" "}
          {opportunity.category}
        </p>
      </div>

      <p className="mt-6 leading-relaxed text-slate-700">
        {opportunity.description}
      </p>

      <Link
        href={opportunity.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex w-fit rounded-md bg-sky-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-sky-800"
      >
        Apply Here
      </Link>
    </main>
  );
}
