/**
 * search.worker.ts
 *
 * Runs on a dedicated thread. Has no access to window, document, or React.
 *
 * Responsibilities:
 *  1. Fetch and stream-parse the sponsor CSV (PapaParse `step` callback)
 *  2. Store the parsed master list in worker memory (never cloned to main thread
 *     until needed — only filtered subsets are transferred)
 *  3. Apply filter + search + sort on demand and post back matching rows
 *
 * PERFORMANCE DECISIONS:
 * - `_searchString` is pre-computed at parse time to avoid repeated toLowerCase
 *   concatenation inside the hot loop.
 * - `_routeTrimmed` and `_typeRatingTrimmed` are also pre-trimmed at parse time;
 *   the original code called `.trim()` on every row for every filter request.
 * - The `scored` array is only populated when there is an active search term.
 *   Filter-only requests skip scoring entirely and preserve CSV order.
 * - `normalise` is imported from the shared lib (same function used in location.ts)
 *   so city matching is consistent across both threads.
 */

import Papa from "papaparse";
import { normalise } from "@/lib/normalise";
import type { Sponsor } from "@/types";
import type {
  InboundMessage,
  OutboundMessage,
  FilterPayload,
} from "@/types/search.types";

// ─── Internal extended row type ───────────────────────────────────────────────
// Not exported — the main thread only needs the public Sponsor shape.

interface SponsorInternal extends Sponsor {
  /** Lowercased "Organisation Name Town/City" for fast substring search. */
  _searchString: string;
  /** Pre-trimmed Route value to avoid per-comparison .trim() in the hot loop. */
  _routeTrimmed: string;
  /** Pre-trimmed Type & Rating value. */
  _typeRatingTrimmed: string;
}

// ─── Typed postMessage ────────────────────────────────────────────────────────

function post(message: OutboundMessage): void {
  self.postMessage(message);
}

// ─── State ────────────────────────────────────────────────────────────────────

let masterData: SponsorInternal[] = [];
let isParsed = false;

// ─── Message dispatch ─────────────────────────────────────────────────────────

self.onmessage = (event: MessageEvent<InboundMessage>): void => {
  const { type, payload } = event.data;

  switch (type) {
    case "INIT_PARSE":
      handleParse(payload.url);
      break;

    case "FILTER":
      handleFilter(payload);
      break;

    default: {
      // Exhaustive check — TypeScript will error here if a new message type
      // is added to InboundMessage without a corresponding case.
      const _exhaustive: never = type;
      console.warn("[worker] Unhandled message type:", _exhaustive);
    }
  }
};

// ─── Parse ────────────────────────────────────────────────────────────────────

function handleParse(url: string): void {
  masterData = [];
  isParsed = false;

  Papa.parse<Record<string, string>>(url, {
    download: true,
    header: true,
    skipEmptyLines: true,

    step: (result) => {
      const row = result.data;
      const name = (row["Organisation Name"] ?? "").trim();
      if (!name) return;

      const city = (row["Town/City"] ?? "").trim();
      const typeRating = (row["Type & Rating"] ?? "").trim();
      const route = (row["Route"] ?? "").trim();

      masterData.push({
        "Organisation Name": name,
        "Town/City": city,
        "Type & Rating": typeRating,
        Route: route,
        // Pre-compute at parse time — used in every filter request.
        _searchString: `${name} ${city}`.toLowerCase(),
        _routeTrimmed: route,
        _typeRatingTrimmed: typeRating,
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

// ─── Filter ───────────────────────────────────────────────────────────────────

/**
 * Scoring tiers (only applied when there is an active search term):
 *
 * 3 — exact match     "EY" === "EY"
 * 2 — prefix match    "EY ADVISORY" starts with "EY"
 * 1 — word boundary   "ERNST & YOUNG EY" contains " EY"
 * 0 — substring       "ACCOUNTANCY EY LTD" contains "EY" somewhere
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
    post({ type: "FILTER_RESULTS", payload: { requestId, results: [] } });
    return;
  }

  const searchLower = search.toLowerCase().trim();
  const hasSearch = searchLower.length > 0;
  const hasRoute = route !== "All";
  const hasTypeRating = typeRating !== "All";
  const hasLocation = locationCities.length > 0;

  // Normalise cities once, outside the loop.
  const normCities: string[] = hasLocation ? locationCities.map(normalise) : [];

  // Two separate accumulators avoid branching in the hot loop.
  type Scored = { score: number; sponsor: Sponsor };
  const scored: Scored[] = [];
  const unscored: Sponsor[] = [];

  for (let i = 0; i < masterData.length; i++) {
    const row = masterData[i];

    if (hasSearch && !row._searchString.includes(searchLower)) continue;
    if (hasRoute && row._routeTrimmed !== route) continue;
    if (hasTypeRating && row._typeRatingTrimmed !== typeRating) continue;
    if (hasLocation && !matchesLocation(row["Town/City"], normCities)) continue;

    const sponsor = stripInternal(row);

    if (hasSearch) {
      const nameLower = row["Organisation Name"].toLowerCase();
      scored.push({ score: scoreMatch(nameLower, searchLower), sponsor });
    } else {
      unscored.push(sponsor);
    }
  }

  const results: Sponsor[] = hasSearch
    ? scored.sort((a, b) => b.score - a.score).map((s) => s.sponsor)
    : unscored;

  post({ type: "FILTER_RESULTS", payload: { requestId, results } });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesLocation(rowCity: string, normCities: string[]): boolean {
  const normRow = normalise(rowCity ?? "");
  return normCities.some(
    (city) => normRow.includes(city) || city.includes(normRow),
  );
}

function stripInternal({
  _searchString: _s,
  _routeTrimmed: _r,
  _typeRatingTrimmed: _t,
  ...rest
}: SponsorInternal): Sponsor {
  return rest;
}
