/**
 * search.worker.types.ts
 *
 * Shared message protocol types for the search worker.
 *
 * WHY A SEPARATE FILE?
 * Both search.worker.ts (the worker) and useSearchWorker.ts (the hook) need
 * to agree on what messages look like. If each file defined its own types,
 * they could silently diverge — the worker sends one shape, the hook expects
 * another, and TypeScript can't catch it because they never reference each other.
 *
 * By importing from this single file, a change to any message type is
 * immediately flagged as an error in every place that uses it.
 */

import type { Sponsor } from "@/types";

// ---------------------------------------------------------------------------
// Inbound messages — main thread → worker
// ---------------------------------------------------------------------------

export interface InitParseMessage {
  type: "INIT_PARSE";
  payload: { url: string };
}

export interface FilterPayload {
  requestId: number;
  search: string;
  route: string; // "All" means no filter
  typeRating: string; // "All" means no filter
  locationCities: string[];
}

export interface FilterMessage {
  type: "FILTER";
  payload: FilterPayload;
}

/** Discriminated union of every valid message the worker can receive */
export type InboundMessage = InitParseMessage | FilterMessage;

// ---------------------------------------------------------------------------
// Outbound messages — worker → main thread
// ---------------------------------------------------------------------------

export interface ParseCompleteMessage {
  type: "PARSE_COMPLETE";
  payload: {
    count: number;
    results: Sponsor[];
  };
}

export interface ParseErrorMessage {
  type: "PARSE_ERROR";
  payload: { message: string };
}

export interface FilterResultsMessage {
  type: "FILTER_RESULTS";
  payload: {
    requestId: number;
    results: Sponsor[];
  };
}

/** Discriminated union of every valid message the worker can send */
export type OutboundMessage =
  | ParseCompleteMessage
  | ParseErrorMessage
  | FilterResultsMessage;
