"use client";

import { useState } from "react";

type OpportunityFormValues = {
  title: string;
  slug: string;
  organisation: string;
  location: string;
  deadline: string;
  category: string;
  tagsInput: string;
  description: string;
  applyUrl: string;
};

const initialFormValues: OpportunityFormValues = {
  title: "",
  slug: "",
  organisation: "",
  location: "",
  deadline: "",
  category: "Internship",
  tagsInput: "",
  description: "",
  applyUrl: "",
};

// A slug is a URL-friendly version of a title.
// Example: "Marine Conservation Internship" -> "marine-conservation-internship".
// Slugs are used in routes like /opportunities/[slug] so each post has
// a clean, readable link that is easy to share.
const generateSlugFromTitle = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export default function AdminPage() {
  // This page is a client component because it needs interactivity.
  // In Next.js App Router, only client components can use hooks like useState
  // and react immediately when users type into form inputs.

  // Form state is one object that stores all field values in memory.
  // As users type, we update this object so the UI always reflects
  // the most current values.
  const [formValues, setFormValues] = useState<OpportunityFormValues>(
    initialFormValues,
  );
  const [copyMessage, setCopyMessage] = useState("");

  // We track whether the admin has manually edited the slug field.
  // If they have, we stop auto-overwriting it from the title so they keep control.
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // This reusable handler updates exactly one field at a time.
  // Each input passes its field name and latest value.
  // We keep previous fields with ...previous and overwrite only the changed field.
  const handleFieldChange = (
    field: keyof OpportunityFormValues,
    value: string,
  ) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // When title changes, we still update title immediately.
  // If slug has not been manually edited, we auto-generate it from title.
  const handleTitleChange = (value: string) => {
    setFormValues((previous) => ({
      ...previous,
      title: value,
      slug: isSlugManuallyEdited ? previous.slug : generateSlugFromTitle(value),
    }));
  };

  // Slug stays editable so admins can customize URLs when needed.
  // Example: shorten long slugs or match an existing naming standard.
  const handleSlugChange = (value: string) => {
    setIsSlugManuallyEdited(true);
    handleFieldChange("slug", value);
  };

  // The Clipboard API is a browser feature that lets web apps read or write
  // text from the user's clipboard (with permission rules handled by browser).
  // Here we use writeText() to copy the generated object string.
  // This improves workflow by removing manual highlight and copy steps.
  const handleCopyObject = async () => {
    try {
      await navigator.clipboard.writeText(objectPreview);
      setCopyMessage("Copied!");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch {
      setCopyMessage("Copy failed. Please copy manually.");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  // We let admins type tags as comma-separated text because it is faster in a form.
  // Example input: "Marine, Fieldwork, Seychelles"
  // split(",") converts one string into an array, then trim() cleans spaces,
  // and filter(Boolean) removes empty items.
  // Arrays are easier to work with in UI code because we can map over them to
  // render tag pills in the opportunities cards.
  const parsedTags = formValues.tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  // We build a string that looks like a TypeScript object entry.
  // This helps avoid manually writing opportunity objects by hand.
  // The admin can fill the form, copy this preview, and paste it into
  // lib/opportunities.ts with a much lower chance of formatting mistakes.
  const objectPreview = `{
  slug: ${JSON.stringify(formValues.slug)},
  title: ${JSON.stringify(formValues.title)},
  organisation: ${JSON.stringify(formValues.organisation)},
  location: ${JSON.stringify(formValues.location)},
  deadline: ${JSON.stringify(formValues.deadline)},
  category: ${JSON.stringify(formValues.category)},
  tags: ${JSON.stringify(parsedTags)},
  description: ${JSON.stringify(formValues.description)},
  applyUrl: ${JSON.stringify(formValues.applyUrl)},
},`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Admin: New Opportunity</h1>
      <p className="mt-3 text-slate-700">
        Fill this form to generate a ready-to-paste opportunity object.
      </p>

      <form className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Title</span>
          <input
            type="text"
            value={formValues.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Marine Conservation Internship"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Slug</span>
          <input
            type="text"
            value={formValues.slug}
            onChange={(event) => handleSlugChange(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="marine-conservation-internship"
          />
          <span className="text-xs text-slate-500">
            Auto-generated from title, but you can edit it manually.
          </span>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Organisation</span>
          <input
            type="text"
            value={formValues.organisation}
            onChange={(event) =>
              handleFieldChange("organisation", event.target.value)
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Island Conservation Society"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Location</span>
          <input
            type="text"
            value={formValues.location}
            onChange={(event) =>
              handleFieldChange("location", event.target.value)
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Mahe, Seychelles"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Deadline</span>
          <input
            type="date"
            value={formValues.deadline}
            onChange={(event) => handleFieldChange("deadline", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Category</span>
          <select
            value={formValues.category}
            onChange={(event) => handleFieldChange("category", event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option>Internship</option>
            <option>Fellowship</option>
            <option>Scholarship</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Description</span>
          <textarea
            value={formValues.description}
            onChange={(event) =>
              handleFieldChange("description", event.target.value)
            }
            className="min-h-28 rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Describe the opportunity, tasks, and who should apply."
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Tags</span>
          <input
            type="text"
            value={formValues.tagsInput}
            onChange={(event) => handleFieldChange("tagsInput", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Marine, Fieldwork, Seychelles"
          />
          <span className="text-xs text-slate-500">
            Enter tags separated by commas.
          </span>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Apply URL</span>
          <input
            type="url"
            value={formValues.applyUrl}
            onChange={(event) => handleFieldChange("applyUrl", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="https://example.org/opportunities/marine-conservation-internship"
          />
        </label>
      </form>

      <section className="mt-8 rounded-xl border border-slate-200 bg-slate-950 p-5 text-slate-100">
        <h2 className="text-lg font-semibold">Generated Opportunity Object</h2>
        <p className="mt-2 text-sm text-slate-300">
          Copy this output and paste it into the opportunities array in
          lib/opportunities.ts.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md bg-slate-900 p-4 text-sm leading-relaxed">
          <code>{objectPreview}</code>
        </pre>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyObject}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
          >
            Copy Opportunity Object
          </button>
          {copyMessage && <p className="text-sm text-slate-200">{copyMessage}</p>}
        </div>
      </section>
    </main>
  );
}
