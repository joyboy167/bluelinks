import Link from "next/link";

export default function Home() {
  return (
    // This outer wrapper creates a full-screen canvas.
    // Why it exists: every page needs a stable base so content placement is predictable.
    // How it fits the site: this is the root homepage route ("/") and sets the first visual impression.
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      {/*
        This main section holds the core homepage message in one centered column.
        Why it exists: a focused layout helps visitors quickly understand what BlueLinks is.
        How it fits the site: this acts as the landing "entry point" before users navigate to deeper pages.
      */}
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        {/*
          This heading displays the project name clearly.
          Why it exists: users should instantly know which platform they are on.
          How it fits the site: it establishes BlueLinks brand identity at the top of the homepage.
        */}
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">BlueLinks</h1>

        {/*
          This paragraph explains the mission of the platform.
          Why it exists: context builds trust and helps users decide whether the site is relevant to them.
          How it fits the site: this is the homepage summary that introduces the purpose of BlueLinks.
        */}
        <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
          A platform helping young people in Seychelles and Small Island
          Developing States discover opportunities in conservation, climate, and
          ocean careers.
        </p>

        {/*
          This call-to-action link invites users to continue into the opportunities area.
          Why it exists: homepages should guide users toward a meaningful next step.
          How it fits the site: it connects the landing page to the opportunities section of the app.
        */}
        <Link
          href="/opportunities"
          className="inline-flex rounded-md bg-sky-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-sky-800"
        >
          View opportunities
        </Link>
      </main>
    </div>
  );
}
