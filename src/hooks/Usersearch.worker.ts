/**
 * useSearchWorker.ts
 *
 * A custom React hook that owns the full lifecycle of the search worker:
 *   - Creates the worker once on mount
 *   - Sends the CSV URL to kick off parsing
 *   - Sends filter state (debounced) whenever it changes
 *   - Receives results and updates state
 *   - Terminates the worker on unmount (prevents memory leaks)
 *
 * WHY A CUSTOM HOOK?
 * Hooks let you pull stateful logic out of components. The component
 * (SearchFilters) shouldn't need to know HOW the worker works — it just
 * provides filter state and gets results back. This separation makes both
 * the hook and the component easier to reason about and test.
 *
 * PRINCIPLES USED:
 *  - useRef for the worker instance (mutable, doesn't trigger re-renders)
 *  - useRef for the debounce timer (same reason)
 *  - useRef for the requestId counter (race condition guard)
 *  - useEffect for side effects (worker creation, filter dispatch, cleanup)
 *  - Cleanup functions in useEffect to prevent memory leaks
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Sponsor } from "@/types";

// How long to wait after the last filter change before sending to the worker.
// 150ms is the sweet spot: fast enough to feel instant, slow enough to avoid
// flooding the worker on rapid keystrokes.
const DEBOUNCE_MS = 150;

export interface UseSearchWorkerOptions {
  csvUrl: string;
  search: string;
  route: string;
  typeRating: string;
  locationCities: string[];
}

export interface UseSearchWorkerResult {
  data: Sponsor[];
  isLoading: boolean;
  totalCount: number;
}

export function useSearchWorker({
  csvUrl,
  search,
  route,
  typeRating,
  locationCities,
}: UseSearchWorkerOptions): UseSearchWorkerResult {
  const [data, setData] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // useRef because we need a stable reference to the worker that:
  //  a) persists across renders
  //  b) doesn't CAUSE re-renders when it changes
  const workerRef = useRef<Worker | null>(null);

  // A counter we increment on every filter dispatch.
  // The worker echoes it back with results. If the returned ID doesn't
  // match our current counter, we know the result is stale (from a
  // superseded request) and we discard it.
  // This solves the RACE CONDITION: user types fast → multiple requests
  // in flight → results could arrive out of order.
  const requestIdRef = useRef(0);

  // Debounce timer ref — storing in a ref means clearing it in the cleanup
  // doesn't require it to be in the dependency array.
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Effect 1: Create the worker once, set up message handling, kick off parse
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Vite requires this exact syntax to bundle workers correctly.
    // The { type: 'module' } option lets the worker use ES module imports
    // (which is how PapaParse is imported inside it).
    const worker = new Worker(
      new URL("../workers/search.worker.js", import.meta.url),
      { type: "module" },
    );

    workerRef.current = worker;

    // Set up the message handler BEFORE sending any messages, so we don't
    // miss any responses.
    worker.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case "PARSE_COMPLETE":
          // Initial load — all rows are sent once. After this the worker
          // keeps the master data and we only get filtered subsets.
          setTotalCount(payload.count);
          setData(payload.results);
          setIsLoading(false);
          break;

        case "FILTER_RESULTS":
          // Only apply results if this matches the most recent request.
          // Stale responses from superseded requests are silently dropped.
          if (payload.requestId === requestIdRef.current) {
            setData(payload.results);
          }
          break;

        case "PARSE_ERROR":
          console.error("[worker] Parse failed:", payload.message);
          setIsLoading(false);
          break;
      }
    };

    worker.onerror = (err) => {
      console.error("[worker] Uncaught error:", err.message);
      setIsLoading(false);
    };

    // Kick off CSV parsing immediately.
    worker.postMessage({
      type: "INIT_PARSE",
      payload: { url: csvUrl },
    });

    // CLEANUP: when the component unmounts, terminate the worker.
    // Without this, the worker keeps running in memory forever.
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [csvUrl]); // Only re-run if the CSV URL changes (it won't in practice)

  // ---------------------------------------------------------------------------
  // Effect 2: Dispatch filter messages whenever filter state changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Don't send filter messages before the worker has finished parsing.
    // isLoading serves as our "ready" gate.
    if (isLoading) return;

    // Clear any pending debounce timer — we're starting a new one.
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!workerRef.current) return;

      // Increment the request ID. This is what lets us detect stale responses.
      const id = ++requestIdRef.current;

      workerRef.current.postMessage({
        type: "FILTER",
        payload: {
          requestId: id,
          search,
          route,
          typeRating,
          locationCities,
        },
      });
    }, DEBOUNCE_MS);

    // Cleanup: clear the timer if the effect re-runs before the timeout fires.
    // This is what makes debouncing work — rapid changes cancel previous timers.
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isLoading, search, route, typeRating, locationCities]);

  return { data, isLoading, totalCount };
}
