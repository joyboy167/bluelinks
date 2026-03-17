import Link from "next/link";

import { supabase } from "../../../lib/supabase";

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

  // Fetch one row from Supabase where the slug column matches the route slug.
  // .single() tells Supabase we expect exactly one matching row.
  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", slug)
    .single();

  const formattedDeadline = opportunity?.deadline
    ? new Date(opportunity.deadline).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "No deadline listed";

  // Slug-based routing is common in content systems (job boards, blogs, docs)
  // because each item can have a human-readable, shareable URL.
  // The list page links to /opportunities/{slug}, and this details page queries
  // the database for that exact slug.
  if (!opportunity) {
    return (
      <main className="relative mx-auto flex min-h-screen w-full max-w-none flex-col items-center justify-center overflow-hidden bg-[radial-gradient(1000px_420px_at_10%_0%,rgba(14,165,233,0.2),transparent_65%),radial-gradient(900px_350px_at_92%_15%,rgba(20,184,166,0.16),transparent_62%),linear-gradient(to_bottom,#e8f3f5,#dff0ef_48%,#d7ece9)] px-6 py-16 text-center">
        <div className="rounded-3xl border border-white/80 bg-white/80 px-8 py-10 shadow-[0_24px_55px_-34px_rgba(15,23,42,0.5)] backdrop-blur-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Opportunity not found</h1>
          <p className="mt-3 text-slate-600">
          We could not find an opportunity for this URL slug.
          </p>
          <Link
            href="/opportunities"
            className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Opportunities
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-none overflow-hidden bg-[radial-gradient(1100px_460px_at_6%_-5%,rgba(14,165,233,0.2),transparent_66%),radial-gradient(900px_400px_at_95%_12%,rgba(20,184,166,0.16),transparent_62%),linear-gradient(to_bottom,#e8f3f5,#dff0ef_44%,#d5ebe9)] px-5 py-12 sm:px-8 sm:py-14 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        {/*
          Top hero block keeps the most important info together:
          image, title, and quick context chips.
        */}
        <section className="overflow-hidden rounded-3xl border border-teal-200/60 bg-white/85 shadow-[0_30px_70px_-42px_rgba(15,23,42,0.45)] backdrop-blur-sm">
          {opportunity.image_url ? (
            <div className="relative h-56 w-full sm:h-72 lg:h-80">
              <img
                src={opportunity.image_url}
                alt={opportunity.title}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/15 to-transparent" />
            </div>
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-semibold tracking-wide text-slate-700 sm:h-72 lg:h-80">
              no image yet
            </div>
          )}

          <div className="space-y-5 p-6 sm:p-8">
            <Link
              href="/opportunities"
              className="inline-flex rounded-full border border-slate-300 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Back to opportunities
            </Link>

            <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {opportunity.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-300/70 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-900">
                {opportunity.category}
              </span>
              {opportunity.mode && (
                <span className="rounded-full border border-emerald-300/70 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900">
                  {opportunity.mode}
                </span>
              )}
              {opportunity.compensation_type && (
                <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
                  {opportunity.compensation_type}
                </span>
              )}
            </div>
          </div>
        </section>

        {/*
          Metadata cards create a fast-scannable details strip.
          This improves clarity without changing any data behavior.
        */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organisation</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{opportunity.organisation}</p>
          </article>
          <article className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{opportunity.location}</p>
          </article>
          <article className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deadline</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{formattedDeadline}</p>
          </article>
          <article className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-800">{opportunity.slug}</p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <article className="rounded-3xl border border-white/70 bg-white/92 p-6 shadow-[0_22px_50px_-36px_rgba(15,23,42,0.45)] sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">About this opportunity</h2>
            <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-700">
              {opportunity.description}
            </p>

            {opportunity.eligibility && (
              <div className="mt-8 rounded-2xl border border-cyan-200/70 bg-cyan-50/80 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-900">Eligibility</h3>
                <p className="mt-2 leading-7 text-slate-700">{opportunity.eligibility}</p>
              </div>
            )}

            {(opportunity.tags ?? []).length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Tags</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(opportunity.tags ?? []).map((tag: string) => (
                    <span
                      key={`${opportunity.slug}-${tag}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="rounded-3xl border border-white/70 bg-gradient-to-br from-slate-900 to-cyan-900 p-6 text-white shadow-[0_24px_60px_-35px_rgba(2,6,23,0.8)] sm:p-7">
            <h2 className="text-lg font-semibold tracking-tight">Apply</h2>
            <p className="mt-3 text-sm leading-7 text-cyan-100">
              Ready to apply? Use the official application link below.
            </p>

            <Link
              href={opportunity.apply_url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-teal-400"
            >
              Apply Here
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
}
