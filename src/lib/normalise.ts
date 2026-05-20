/**
 * normalise.ts
 *
 * Single source of truth for the town/city normalisation logic used in:
 *  - location.ts  (main thread — building the city list from API responses)
 *  - search.worker.ts  (worker — matching rows against the city list)
 *
 * WHY SHARED?
 * Both sides must normalise strings the same way, otherwise a city string
 * built in the main thread ("Milton Keynes") would fail to match a row
 * normalised differently in the worker ("miltonkeynes"). A single function
 * guarantees they're always in sync.
 *
 * WHY NOT IN types/?
 * This is runtime logic, not a type declaration. Runtime utilities live in lib/.
 */

/**
 * Lowercases, trims, collapses whitespace, strips hyphens/commas, and removes
 * any character that isn't alphanumeric or a space.
 *
 * "St. Albans" → "st albans"
 * "Milton-Keynes" → "milton keynes"
 * "Newcastle upon Tyne," → "newcastle upon tyne"
 */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[-,]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, "");
}
