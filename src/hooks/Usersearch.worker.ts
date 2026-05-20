/**
 * useSearchWorker.ts
 *
 * Owns the full lifecycle of the search Web Worker:
 *  - Creates the worker once on mount and terminates it on unmount.
 *  - Sends the CSV URL to kick off streaming parse.
 *  - Debounces and sends filter state whenever it changes.
 *  - Receives results and exposes them as React state.
 *
 * KEY DESIGN DECISIONS:
 *
 * isParsedRef (not isLoading state):
 *   The previous implementation gated filter dispatches on `isLoading`. This
 *   worked, but it meant Effect 2 re-ran every time `isLoading` flipped —
 *   including back to `false` after parse. Using a ref (`isParsedRef`) avoids
 *   this: the ref change doesn't trigger a re-render or re-run the effect, and
 *   the debounce timer in Effect 2 checks it synchronously at fire time.
 *
 * locationCities stable reference:
 *   `locationCities` is a string array that may be reconstructed as a new array
 *   instance on every render (even if the contents are identical). Using it
 *   directly in the dependency array would fire the debounce on every render.
 *   We JSON-stringify it to produce a stable scalar for comparison.
 *
 * requestIdRef race-condition guard:
 *   Rapid typing fires many FILTER messages. Results can arrive out of order.
 *   We increment a counter on every dispatch and only apply a result if its
 *   echoed-back ID matches the current counter.
 */

import { useEffect, useRef, useState } from "react";
import type { Sponsor } from "@/types";

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

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracks whether the worker has finished its initial parse. Using a ref
  // (not state) because we don't want the change to trigger a re-render or
  // cause Effect 2 to re-run via the dependency array.
  const isParsedRef = useRef(false);

  // Stable scalar representation of locationCities. JSON.stringify returns the
  // same string when the array contents are the same, preventing spurious
  // debounce triggers when the parent re-renders with a new array instance.
  const locationCitiesKey = JSON.stringify(locationCities);

  // ─── Effect 1: Worker lifecycle ──────────────────────────────────────────────
  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/search.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent): void => {
      const { type, payload } = event.data;

      switch (type) {
        case "PARSE_COMPLETE":
          isParsedRef.current = true;
          setTotalCount(payload.count);
          setData(payload.results);
          setIsLoading(false);
          break;

        case "FILTER_RESULTS":
          // Discard stale responses from superseded requests.
          if (payload.requestId === requestIdRef.current) {
            setData(payload.results);
          }
          break;

        case "PARSE_ERROR":
          console.error("[useSearchWorker] Parse failed:", payload.message);
          setIsLoading(false);
          break;
      }
    };

    worker.onerror = (err: ErrorEvent): void => {
      console.error("[useSearchWorker] Worker error:", err.message);
      setIsLoading(false);
    };

    worker.postMessage({ type: "INIT_PARSE", payload: { url: csvUrl } });

    return () => {
      worker.terminate();
      workerRef.current = null;
      isParsedRef.current = false;
    };
  }, [csvUrl]);

  // ─── Effect 2: Filter dispatch ───────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      // Check the ref at fire time — if parse hasn't completed yet, skip.
      if (!workerRef.current || !isParsedRef.current) return;

      const id = ++requestIdRef.current;

      workerRef.current.postMessage({
        type: "FILTER",
        payload: {
          requestId: id,
          search,
          route,
          typeRating,
          // Re-parse from the stable key so we send the actual array.
          locationCities: JSON.parse(locationCitiesKey) as string[],
        },
      });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // locationCitiesKey is the stable scalar derived from locationCities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, route, typeRating, locationCitiesKey]);

  return { data, isLoading, totalCount };
}
