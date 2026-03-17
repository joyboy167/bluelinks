"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

type AdminTab = "add" | "edit" | "delete";

type OpportunityFormValues = {
  title: string;
  slug: string;
  organisation: string;
  location: string;
  mode: string;
  deadline: string;
  category: string;
  description: string;
  apply_url: string;
  tags: string;
  image_url: string;
  eligibility: string;
  compensation_type: string;
};

type OpportunityRecord = {
  id: number;
  title: string;
  slug: string;
  organisation: string;
  location: string;
  mode?: string | null;
  deadline?: string | null;
  category: string;
  description: string;
  apply_url?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  eligibility?: string | null;
  compensation_type?: string | null;
};

const initialFormValues: OpportunityFormValues = {
  title: "",
  slug: "",
  organisation: "",
  location: "",
  mode: "hybrid",
  deadline: "",
  category: "internship",
  description: "",
  apply_url: "",
  tags: "",
  image_url: "",
  eligibility: "",
  compensation_type: "unknown",
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
  const [activeTab, setActiveTab] = useState<AdminTab>("add");

  // Form state stores all field values in one place.
  // This makes submission and reset logic much easier for beginners to follow.
  const [formValues, setFormValues] = useState<OpportunityFormValues>(
    initialFormValues,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // These states power the Edit/Delete tabs.
  // We keep one local list of opportunities so both tabs can reuse it.
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(
    null,
  );

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

  // Convert a database row into form field strings.
  // This lets the Edit tab load existing records directly into the same form.
  const mapOpportunityToFormValues = (
    opportunity: OpportunityRecord,
  ): OpportunityFormValues => {
    return {
      title: opportunity.title,
      slug: opportunity.slug,
      organisation: opportunity.organisation,
      location: opportunity.location,
      mode: opportunity.mode ?? "hybrid",
      deadline: opportunity.deadline ?? "",
      category: opportunity.category,
      description: opportunity.description,
      apply_url: opportunity.apply_url ?? "",
      tags: (opportunity.tags ?? []).join(", "),
      image_url: opportunity.image_url ?? "",
      eligibility: opportunity.eligibility ?? "",
      compensation_type: opportunity.compensation_type ?? "unknown",
    };
  };

  // Fetch all opportunities for Edit and Delete tabs.
  // We keep this in one function so add/edit/delete can all refresh the same list.
  const loadOpportunities = async () => {
    setIsLoadingOpportunities(true);

    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setIsLoadingOpportunities(false);
      return;
    }

    setOpportunities((data ?? []) as OpportunityRecord[]);
    setIsLoadingOpportunities(false);
  };

  // Clicking an item in Edit loads that row into the shared form.
  const handleSelectOpportunityForEdit = (opportunity: OpportunityRecord) => {
    setSelectedOpportunityId(opportunity.id);
    setFormValues(mapOpportunityToFormValues(opportunity));

    // Once an existing row is loaded, treat slug as manually controlled.
    // This prevents accidental slug changes while editing title text.
    setIsSlugManuallyEdited(true);
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Tags are typed as one comma-separated string for faster copy-paste publishing.
  // We convert it to an array right before sending to Supabase.
  const parsedTags = formValues.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  // This submit handler is reused by Add and Edit tabs.
  // Add inserts a new row, Edit updates the selected row.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      title: formValues.title,
      slug: formValues.slug,
      organisation: formValues.organisation,
      location: formValues.location,
      mode: formValues.mode || null,
      deadline: formValues.deadline || null,
      category: formValues.category,
      description: formValues.description,
      apply_url: formValues.apply_url || null,
      tags: parsedTags,
      image_url: formValues.image_url || null,
      eligibility: formValues.eligibility || null,
      compensation_type: formValues.compensation_type || null,
    };

    const isEditMode = activeTab === "edit";
    const shouldUpdate = isEditMode && selectedOpportunityId !== null;

    const { error } = shouldUpdate
      ? await supabase
          .from("opportunities")
          .update(payload)
          .eq("id", selectedOpportunityId)
      : await supabase.from("opportunities").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    if (shouldUpdate) {
      setSuccessMessage("Opportunity updated successfully.");
    } else {
      // On add success, reset so admins can quickly publish the next item.
      setSuccessMessage("Opportunity published successfully.");
      setFormValues(initialFormValues);
      setIsSlugManuallyEdited(false);
      setSelectedOpportunityId(null);
    }

    await loadOpportunities();
    setIsSaving(false);
  };

  // Delete asks for confirmation first, then removes the row in Supabase.
  const handleDeleteOpportunity = async (opportunity: OpportunityRecord) => {
    const shouldDelete = window.confirm(
      `Delete "${opportunity.title}"? This cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", opportunity.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Opportunity deleted successfully.");

    // If the deleted item was selected in Edit, reset the form to avoid stale data.
    if (selectedOpportunityId === opportunity.id) {
      setSelectedOpportunityId(null);
      setFormValues(initialFormValues);
      setIsSlugManuallyEdited(false);
    }

    await loadOpportunities();
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Opportunities</h1>
      <p className="mt-3 text-slate-700">
        Add, update, and remove opportunities directly in Supabase.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab("add");
            setSuccessMessage("");
            setErrorMessage("");
          }}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "add"
              ? "bg-sky-700 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Add New
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("edit");
            setSuccessMessage("");
            setErrorMessage("");
            void loadOpportunities();
          }}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "edit"
              ? "bg-sky-700 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Edit Existing
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("delete");
            setSuccessMessage("");
            setErrorMessage("");
            void loadOpportunities();
          }}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "delete"
              ? "bg-sky-700 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Delete Existing
        </button>
      </div>

      {(activeTab === "add" || activeTab === "edit") && (
        <>
          {activeTab === "edit" && (
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Select an opportunity to edit
              </h2>

              {isLoadingOpportunities ? (
                <p className="mt-3 text-sm text-slate-600">Loading opportunities...</p>
              ) : opportunities.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">
                  No opportunities found.
                </p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {opportunities.map((opportunity) => (
                    <button
                      key={opportunity.id}
                      type="button"
                      onClick={() => handleSelectOpportunityForEdit(opportunity)}
                      className={`rounded-md border px-3 py-2 text-left transition-colors ${
                        selectedOpportunityId === opportunity.id
                          ? "border-sky-500 bg-sky-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {opportunity.title}
                      </p>
                      <p className="text-xs text-slate-600">{opportunity.organisation}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Title</span>
          <input
            type="text"
            value={formValues.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
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
            required
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
            required
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
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Mahe, Seychelles"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Mode</span>
          <select
            value={formValues.mode}
            onChange={(event) => handleFieldChange("mode", event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option>remote</option>
            <option>hybrid</option>
            <option>on-site</option>
            <option>fieldwork</option>
          </select>
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
            required
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option>internship</option>
            <option>fellowship</option>
            <option>scholarship</option>
            <option>research grant</option>
            <option>job</option>
            <option>training</option>
            <option>volunteer</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Description</span>
          <textarea
            value={formValues.description}
            onChange={(event) =>
              handleFieldChange("description", event.target.value)
            }
            required
            className="min-h-28 rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Describe the opportunity, tasks, and who should apply."
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Tags</span>
          <input
            type="text"
            value={formValues.tags}
            onChange={(event) => handleFieldChange("tags", event.target.value)}
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
            value={formValues.apply_url}
            onChange={(event) => handleFieldChange("apply_url", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="https://example.org/opportunities/marine-conservation-internship"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Image URL</span>
          <input
            type="url"
            value={formValues.image_url}
            onChange={(event) => handleFieldChange("image_url", event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="https://images.example.org/opportunity-banner.jpg"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Eligibility</span>
          <textarea
            value={formValues.eligibility}
            onChange={(event) => handleFieldChange("eligibility", event.target.value)}
            className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="Who can apply? Example: Youth aged 18-30 from SIDS regions."
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Compensation Type</span>
          <select
            value={formValues.compensation_type}
            onChange={(event) =>
              handleFieldChange("compensation_type", event.target.value)
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option>funded</option>
            <option>paid</option>
            <option>unpaid</option>
            <option>stipend</option>
            <option>unknown</option>
          </select>
        </label>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSaving || (activeTab === "edit" && selectedOpportunityId === null)}
            className="rounded-md bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving
              ? activeTab === "edit"
                ? "Updating..."
                : "Publishing..."
              : activeTab === "edit"
                ? "Update Opportunity"
                : "Publish"}
          </button>
          {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}
          {errorMessage && <p className="text-sm text-rose-700">{errorMessage}</p>}
        </div>
          </form>
        </>
      )}

      {activeTab === "delete" && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Delete opportunities</h2>

          {isLoadingOpportunities ? (
            <p className="mt-3 text-sm text-slate-600">Loading opportunities...</p>
          ) : opportunities.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No opportunities found.</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {opportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{opportunity.title}</p>
                    <p className="text-xs text-slate-600">{opportunity.organisation}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteOpportunity(opportunity)}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}
            {errorMessage && <p className="text-sm text-rose-700">{errorMessage}</p>}
          </div>
        </section>
      )}
    </main>
  );
}
