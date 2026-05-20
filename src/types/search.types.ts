/**
 * search.types.ts
 *
 * The shared message-passing contract between the main thread and the search
 * Web Worker. Both sides import from here so a type change is caught everywhere
 * at compile time — no silent protocol drift.
 */

import type { Sponsor } from "@/types";

// ─── Main thread → Worker ─────────────────────────────────────────────────────

export interface InitParseMessage {
  type: "INIT_PARSE";
  payload: { url: string };
}

export interface FilterPayload {
  /** Monotonically-increasing counter used to discard stale responses. */
  requestId: number;
  search: string;
  /** "All" means no route filter is applied. */
  route: string;
  /** "All" means no type/rating filter is applied. */
  typeRating: string;
  locationCities: string[];
}

export interface FilterMessage {
  type: "FILTER";
  payload: FilterPayload;
}

export type InboundMessage = InitParseMessage | FilterMessage;

// ─── Worker → Main thread ─────────────────────────────────────────────────────

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

export type OutboundMessage =
  | ParseCompleteMessage
  | ParseErrorMessage
  | FilterResultsMessage;
