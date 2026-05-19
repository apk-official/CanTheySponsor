/**
 * search.worker.ts
 *
 * This file runs on a SEPARATE THREAD — not the main React thread.
 * It has no access to window, document, React, or any UI.
 *
 * Responsibilities:
 *  1. Receive a CSV URL, parse it with PapaParse, store the master list in memory
 *  2. Receive filter state, run the filter logic, post back only the matching rows
 */

import Papa from "papaparse";
import type { Sponsor } from "@/types";
import type {
  InboundMessage,
  OutboundMessage,
  FilterPayload,
} from "@/types/search.types";

// ---------------------------------------------------------------------------
// Internal type — extends the public Sponsor with a pre-computed search string
// The shared types file only exports what the main thread needs to know about.
// SponsorInternal is purely a worker implementation detail.
// ---------------------------------------------------------------------------

interface SponsorInternal extends Sponsor {
  _searchString: string;
}

// ---------------------------------------------------------------------------
// Typed postMessage wrapper
// ---------------------------------------------------------------------------

function post(message: OutboundMessage): void {
  self.postMessage(message);
}

// ---------------------------------------------------------------------------
// Master data store — lives entirely in worker memory, never cloned to main
// ---------------------------------------------------------------------------

let masterData: SponsorInternal[] = [];
let isParsed = false;

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

self.onmessage = (event: MessageEvent<InboundMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case "INIT_PARSE":
      handleParse(payload.url);
      break;

    case "FILTER":
      handleFilter(payload);
      break;

    default: {
      const _exhaustive: never = type;
      console.warn("[worker] Unhandled message type:", _exhaustive);
    }
  }
};

// ---------------------------------------------------------------------------
// INIT_PARSE
// ---------------------------------------------------------------------------

function handleParse(url: string): void {
  masterData = [];
  isParsed = false;

  Papa.parse<Record<string, string>>(url, {
    download: true,
    header: true,
    skipEmptyLines: true,

    step: (result) => {
      const row = result.data;
      const name = row["Organisation Name"] ?? "";
      const city = row["Town/City"] ?? "";
      const typeRating = row["Type & Rating"] ?? "";
      const route = row["Route"] ?? "";

      if (!name.trim()) return;

      masterData.push({
        "Organisation Name": name,
        "Town/City": city,
        "Type & Rating": typeRating,
        Route: route,
        _searchString: `${name} ${city}`.toLowerCase(),
      });
    },

    complete: () => {
      isParsed = true;

      post({
        type: "PARSE_COMPLETE",
        payload: {
          count: masterData.length,
          results: masterData.map(stripInternal),
        },
      });
    },

    error: (err: Error) => {
      post({
        type: "PARSE_ERROR",
        payload: { message: err.message },
      });
    },
  });
}

// ---------------------------------------------------------------------------
// FILTER
// ---------------------------------------------------------------------------

/**
 * Scoring tiers — only applied when there is an active search term.
 * Higher score = closer to the top of results.
 *
 * Score 3 — exact match:     name is exactly the search term ("EY")
 * Score 2 — starts with:     name starts with the search term ("EY ADVISORY...")
 * Score 1 — word boundary:   search term appears at the start of a word
 *                             inside the name ("ERNST & YOUNG EY PARTNER")
 * Score 0 — substring match: search term appears anywhere ("ACCOUNTANCY EY LTD")
 *
 * When there is no search term (filter-only) we skip scoring entirely —
 * no point sorting what doesn't need ranking, and it avoids allocating
 * the scored tuples array for 141k rows unnecessarily.
 */
function scoreMatch(nameLower: string, searchLower: string): number {
  if (nameLower === searchLower) return 3;
  if (nameLower.startsWith(searchLower)) return 2;
  if (nameLower.includes(` ${searchLower}`)) return 1;
  return 0;
}

function handleFilter({
  requestId,
  search,
  route,
  typeRating,
  locationCities,
}: FilterPayload): void {
  if (!isParsed) {
    post({
      type: "FILTER_RESULTS",
      payload: { requestId, results: [] },
    });
    return;
  }

  const searchLower = search.toLowerCase().trim();
  const hasSearch = searchLower.length > 0;
  const hasRoute = route !== "All";
  const hasTypeRating = typeRating !== "All";
  const hasLocation = locationCities.length > 0;

  const normCities: string[] = hasLocation ? locationCities.map(normalise) : [];

  // Two separate accumulators to avoid branching inside the hot loop.
  // scored is only populated when hasSearch is true.
  const scored: Array<{ score: number; sponsor: Sponsor }> = [];
  const unscored: Sponsor[] = [];

  const len = masterData.length;

  for (let i = 0; i < len; i++) {
    const row = masterData[i];

    if (hasSearch && !row._searchString.includes(searchLower)) continue;
    if (hasRoute && row.Route.trim() !== route) continue;
    if (hasTypeRating && row["Type & Rating"].trim() !== typeRating) continue;
    if (hasLocation && !matchesLocation(row["Town/City"], normCities)) continue;

    const sponsor = stripInternal(row);

    if (hasSearch) {
      const nameLower = row["Organisation Name"].toLowerCase();
      scored.push({ score: scoreMatch(nameLower, searchLower), sponsor });
    } else {
      unscored.push(sponsor);
    }
  }

  // Sort descending by score — exact/prefix matches bubble to the top.
  // Filter-only results keep their original CSV order (already alphabetical).
  const results: Sponsor[] = hasSearch
    ? scored.sort((a, b) => b.score - a.score).map((s) => s.sponsor)
    : unscored;

  post({
    type: "FILTER_RESULTS",
    payload: { requestId, results },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalise(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[-,]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, "");
}

function matchesLocation(rowCity: string, normCities: string[]): boolean {
  const normRow = normalise(rowCity ?? "");
  return normCities.some(
    (city) => normRow.includes(city) || city.includes(normRow),
  );
}

function stripInternal({ _searchString, ...rest }: SponsorInternal): Sponsor {
  return rest;
}
