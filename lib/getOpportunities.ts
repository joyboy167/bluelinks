// This file contains a helper function for fetching opportunities
// from the Supabase database.
//
// Separating database code into its own file keeps our page components
// cleaner and makes the code easier to reuse later.

import { supabase } from "./supabase";

// This function asks Supabase for all rows in the "opportunities" table.
// It returns them sorted by deadline in ascending order,
// which means the soonest deadlines appear first.
export async function getOpportunities() {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("deadline", { ascending: true });

  // Temporary compatibility fallback:
  // if the table was accidentally created as "opportunites" (typo),
  // try reading from that table so the app still works while you fix schema names.
  if (error?.code === "PGRST205") {
    const typoResult = await supabase
      .from("opportunites")
      .select("*")
      .order("deadline", { ascending: true });

    if (!typoResult.error) {
      console.warn(
        "Using fallback table 'opportunites'. Rename it to 'opportunities' in Supabase when possible.",
      );
      return typoResult.data;
    }
  }

  // If Supabase returns an error, log it and return an empty array
  // so the page does not crash.
  if (error) {
    // Some browser overlays display PostgREST errors as {}.
    // Logging each field explicitly gives a readable error message
    // like table-not-found or row-level-security policy failures.
    console.error("Error fetching opportunities:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return [];
  }

  // If successful, return the database rows
  return data;
}
