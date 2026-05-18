import { LocationSearchResult } from "@/types";

const POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const OUTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?$/i;

export const isPostcode = (value: string) => POSTCODE_REGEX.test(value.trim());
export const isOutcode = (value: string) => OUTCODE_REGEX.test(value.trim());

export const normalise = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[-,]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, "");

// ------------------------------------
// HAVERSINE — verify actual distance
// ------------------------------------

function getDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3958.8; // Earth radius in miles
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ------------------------------------
// GET COORDINATES from postcode/outcode
// ------------------------------------

async function getCoordinates(input: string): Promise<{
  latitude: number;
  longitude: number;
  displayName: string;
}> {
  const cleanInput = input.trim();

  if (isPostcode(cleanInput)) {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${cleanInput.replace(/\s/g, "")}`,
    );
    const data = await res.json();
    if (data.status !== 200) throw new Error("Invalid postcode");
    return {
      latitude: data.result.latitude,
      longitude: data.result.longitude,
      displayName: data.result.postcode,
    };
  }

  if (isOutcode(cleanInput)) {
    const res = await fetch(
      `https://api.postcodes.io/outcodes/${cleanInput.toUpperCase()}`,
    );
    const data = await res.json();
    if (data.status !== 200) throw new Error("Invalid outcode");
    return {
      latitude: data.result.latitude,
      longitude: data.result.longitude,
      displayName: data.result.outcode,
    };
  }

  throw new Error("Not a postcode or outcode");
}

// ------------------------------------
// GET NEARBY TOWNS via Overpass
// Only city + town, Haversine-verified
// ------------------------------------
const townCache = new Map<string, Promise<string[]>>();

async function getNearbyTowns(
  latitude: number,
  longitude: number,
  radiusMiles: string,
): Promise<string[]> {
  const radiusNum = parseFloat(radiusMiles);
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)},${radiusMiles}`;

  if (townCache.has(cacheKey)) {
    return townCache.get(cacheKey)!;
  }

  const radiusMetres = Math.round(radiusNum * 1609.34);

  const query = `
    [out:json][timeout:30];
    node["place"~"^(city|town)$"]
      (around:${radiusMetres},${latitude},${longitude});
    out body;
  `;

  const promise = fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch nearby towns");
      return res.json();
    })
    .then((data) => {
      if (!data.elements?.length) return [];
      const towns: string[] = data.elements
        .filter((el: any) => {
          if (typeof el.lat !== "number" || typeof el.lon !== "number")
            return false;
          return (
            getDistanceMiles(latitude, longitude, el.lat, el.lon) <= radiusNum
          );
        })
        .map((el: any) => el.tags?.name)
        .filter(
          (name: unknown): name is string =>
            typeof name === "string" && name.length > 0,
        );
      return [...new Set(towns)];
    })
    .catch((err) => {
      // Remove failed promises from cache so retries work
      townCache.delete(cacheKey);
      throw err;
    });

  townCache.set(cacheKey, promise);
  return promise;
}

// ------------------------------------
// GET OWN TOWN from coordinates
// (so the origin city is always included)
// ------------------------------------

async function getOwnTown(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await res.json();
    // zoom=10 returns city/town level
    return (
      data.address?.city || data.address?.town || data.address?.village || null
    );
  } catch {
    return null;
  }
}

// ------------------------------------
// SEARCH LOCATION
// ------------------------------------

export async function searchLocation(
  input: string,
  radiusMiles: string,
): Promise<LocationSearchResult> {
  const clean = input.trim();

  // City/town name typed → return directly, no API needed.
  // normalise() in SearchFilters handles partial matches.
  if (!isPostcode(clean) && !isOutcode(clean)) {
    return {
      cities: [clean],
      displayName: clean,
    };
  }

  // Postcode/outcode → coordinates → nearby towns via Overpass
  const { latitude, longitude, displayName } = await getCoordinates(clean);

  const [nearbyTowns, ownTown] = await Promise.all([
    getNearbyTowns(latitude, longitude, radiusMiles),
    getOwnTown(latitude, longitude),
  ]);

  // Always include the town the postcode sits in
  const allCities = ownTown
    ? [...new Set([ownTown, ...nearbyTowns])]
    : nearbyTowns;

  return {
    cities: allCities,
    displayName,
  };
}

// ------------------------------------
// SEARCH USING CURRENT LOCATION
// ------------------------------------

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
      timeout: 10000,
    });
  });

  const { latitude, longitude } = position.coords;

  // Reverse geocode for postcode display label
  const reverseRes = await fetch(
    `https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}&limit=1`,
  );
  const reverseData = await reverseRes.json();
  const postcode = reverseData.result?.[0]?.postcode || "Current Location";

  const [nearbyTowns, ownTown] = await Promise.all([
    getNearbyTowns(latitude, longitude, radiusMiles),
    getOwnTown(latitude, longitude),
  ]);

  const allCities = ownTown
    ? [...new Set([ownTown, ...nearbyTowns])]
    : nearbyTowns;

  return { cities: allCities, postcode };
}
