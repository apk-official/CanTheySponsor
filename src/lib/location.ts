/**
 * location.ts
 *
 * Converts user-supplied postcodes, outcodes, or city names into a list of
 * nearby town/city names that the search worker can match against CSV rows.
 *
 * External APIs used:
 *  - postcodes.io   — postcode/outcode → lat/lon (UK only)
 *  - Overpass API   — lat/lon → nearby OSM city/town nodes
 *  - Nominatim      — city name → lat/lon, and reverse geocoding
 *
 * CACHING STRATEGY:
 * `nearbyTownsCache` is a simple Map with a MAX_CACHE_SIZE ceiling. Once the
 * ceiling is hit, the oldest entry is evicted (FIFO). This prevents unbounded
 * memory growth in long-running sessions. Cache entries are Promises so
 * concurrent identical requests share a single in-flight fetch.
 */

import { normalise } from "@/lib/normalise";
import type { LocationSearchResult } from "@/types";

// ─── Regex helpers ────────────────────────────────────────────────────────────

const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const OUTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?$/i;

export const isPostcode = (v: string): boolean => POSTCODE_RE.test(v.trim());
export const isOutcode = (v: string): boolean => OUTCODE_RE.test(v.trim());

// ─── Haversine distance ───────────────────────────────────────────────────────

function distanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Bounded promise cache ────────────────────────────────────────────────────

const MAX_CACHE_SIZE = 50;
const nearbyTownsCache = new Map<string, Promise<string[]>>();

function cacheGet(key: string): Promise<string[]> | undefined {
  return nearbyTownsCache.get(key);
}

function cacheSet(key: string, value: Promise<string[]>): void {
  if (nearbyTownsCache.size >= MAX_CACHE_SIZE) {
    // Evict the oldest entry (Map preserves insertion order).
    const firstKey = nearbyTownsCache.keys().next().value;
    if (firstKey !== undefined) nearbyTownsCache.delete(firstKey);
  }
  nearbyTownsCache.set(key, value);
}

// ─── Coordinate resolution ────────────────────────────────────────────────────

interface Coords {
  latitude: number;
  longitude: number;
  displayName: string;
}

async function resolvePostcodeCoords(input: string): Promise<Coords> {
  const clean = input.trim();

  if (isPostcode(clean)) {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${clean.replace(/\s/g, "")}`,
    );
    const data = await res.json();
    if (data.status !== 200) throw new Error("Invalid postcode");
    return {
      latitude: data.result.latitude,
      longitude: data.result.longitude,
      displayName: data.result.postcode,
    };
  }

  if (isOutcode(clean)) {
    const res = await fetch(
      `https://api.postcodes.io/outcodes/${clean.toUpperCase()}`,
    );
    const data = await res.json();
    if (data.status !== 200) throw new Error("Invalid outcode");
    return {
      latitude: data.result.latitude,
      longitude: data.result.longitude,
      displayName: data.result.outcode,
    };
  }

  throw new Error("Input is neither a postcode nor an outcode");
}

// ─── Overpass nearby towns ────────────────────────────────────────────────────

/**
 * Fetches city/town OSM nodes within `radiusMiles` of the given coordinates.
 * Results are Haversine-verified (Overpass `around` can include nodes slightly
 * outside the radius due to bounding-box approximation).
 *
 * Uses a 15-second AbortController timeout to avoid hanging the UI if Overpass
 * is slow.
 */
async function nearbyTowns(
  latitude: number,
  longitude: number,
  radiusMiles: string,
): Promise<string[]> {
  const radiusNum = parseFloat(radiusMiles);
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)},${radiusMiles}`;

  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const radiusMetres = Math.round(radiusNum * 1609.34);
  const query = `
    [out:json][timeout:25];
    node["place"~"^(city|town)$"](around:${radiusMetres},${latitude},${longitude});
    out body;
  `;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  const promise = fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: controller.signal,
  })
    .then((res) => {
      clearTimeout(timer);
      if (!res.ok) throw new Error("Overpass request failed");
      return res.json();
    })
    .then(
      (data: {
        elements?: Array<{
          lat?: number;
          lon?: number;
          tags?: Record<string, string>;
        }>;
      }) => {
        if (!data.elements?.length) return [];
        return [
          ...new Set(
            data.elements
              .filter(
                (el) =>
                  typeof el.lat === "number" &&
                  typeof el.lon === "number" &&
                  distanceMiles(latitude, longitude, el.lat, el.lon) <=
                    radiusNum,
              )
              .map((el) => el.tags?.name ?? "")
              .filter(Boolean),
          ),
        ];
      },
    )
    .catch((err: unknown) => {
      nearbyTownsCache.delete(cacheKey);
      throw err;
    });

  cacheSet(cacheKey, promise);
  return promise;
}

// ─── Reverse-geocode own town ─────────────────────────────────────────────────

async function ownTownFromCoords(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await res.json();
    return (
      (data.address?.city as string | undefined) ??
      (data.address?.town as string | undefined) ??
      (data.address?.village as string | undefined) ??
      null
    );
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function searchLocation(
  input: string,
  radiusMiles: string,
): Promise<LocationSearchResult> {
  const clean = input.trim();

  if (isPostcode(clean) || isOutcode(clean)) {
    const { latitude, longitude, displayName } =
      await resolvePostcodeCoords(clean);

    const [nearby, own] = await Promise.all([
      nearbyTowns(latitude, longitude, radiusMiles),
      ownTownFromCoords(latitude, longitude),
    ]);

    const cities = own ? [...new Set([own, ...nearby])] : nearby;
    return { cities, displayName };
  }

  // City/town name path — geocode via Nominatim first.
  const geocodeRes = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(clean)},UK&format=json&limit=1`,
    { headers: { "Accept-Language": "en" } },
  );
  const geocodeData = await geocodeRes.json();

  if (!geocodeData.length) {
    // Nominatim found nothing — treat the typed string as the city name directly.
    return { cities: [clean], displayName: clean };
  }

  const { lat, lon, display_name } = geocodeData[0] as {
    lat: string;
    lon: string;
    display_name: string;
  };
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  const [nearby, own] = await Promise.all([
    nearbyTowns(latitude, longitude, radiusMiles),
    ownTownFromCoords(latitude, longitude),
  ]);

  // Always include the user's typed name as a fallback in case Overpass misses
  // the exact origin city.
  const cities = [
    ...new Set([clean, own, ...nearby].filter((c): c is string => !!c)),
  ];

  return { cities, displayName: display_name };
}

export async function searchCurrentLocation(radiusMiles: string): Promise<{
  cities: string[];
  postcode: string;
}> {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser.");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10_000,
    });
  });

  const { latitude, longitude } = position.coords;

  const reverseRes = await fetch(
    `https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}&limit=1`,
  );
  const reverseData = await reverseRes.json();
  const postcode: string =
    (reverseData.result?.[0]?.postcode as string | undefined) ??
    "Current Location";

  const [nearby, own] = await Promise.all([
    nearbyTowns(latitude, longitude, radiusMiles),
    ownTownFromCoords(latitude, longitude),
  ]);

  const cities = own ? [...new Set([own, ...nearby])] : nearby;
  return { cities, postcode };
}

// Re-export normalise so callers that previously imported from here don't break.
export { normalise };
