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
// GET COORDINATES
// ------------------------------------

async function getCoordinates(input: string): Promise<{
  latitude: number;
  longitude: number;
  displayName: string;
}> {
  const cleanInput = input.trim();

  // ------------------------------------
  // FULL POSTCODE
  // ------------------------------------

  if (isPostcode(cleanInput)) {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${cleanInput.replace(/\s/g, "")}`,
    );

    const data = await res.json();

    if (data.status !== 200) {
      throw new Error("Invalid postcode");
    }

    return {
      latitude: data.result.latitude,
      longitude: data.result.longitude,
      displayName: data.result.postcode,
    };
  }

  // ------------------------------------
  // OUTCODE
  // ------------------------------------

  if (isOutcode(cleanInput)) {
    const res = await fetch(
      `https://api.postcodes.io/outcodes/${cleanInput.toUpperCase()}`,
    );

    const data = await res.json();

    if (data.status !== 200) {
      throw new Error("Invalid outcode");
    }

    return {
      latitude: data.result.latitude,
      longitude: data.result.longitude,
      displayName: data.result.outcode,
    };
  }

  // ------------------------------------
  // CITY / TOWN
  // ------------------------------------

  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cleanInput,
    )}&format=json&limit=1&countrycodes=gb`,
  );

  const geoData = await geoRes.json();

  if (!geoData.length) {
    throw new Error("Location not found");
  }

  return {
    latitude: parseFloat(geoData[0].lat),
    longitude: parseFloat(geoData[0].lon),
    displayName: cleanInput,
  };
}

// ------------------------------------
// GET NEARBY CITIES
// ------------------------------------

async function getNearbyCities(
  latitude: number,
  longitude: number,
  radiusMiles: string,
): Promise<string[]> {
  const radiusMetres = Math.round(parseInt(radiusMiles) * 1609.34);

  const res = await fetch("https://api.postcodes.io/postcodes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      geolocations: [
        {
          longitude,
          latitude,
          radius: radiusMetres,
          limit: 10000,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch nearby locations");
  }

  const data = await res.json();

  const results = data.result?.[0]?.result;

  if (!results?.length) {
    return [];
  }

  const cities: string[] = results
    .map((item: any) => item.admin_district)
    .filter((city: unknown): city is string => typeof city === "string");

  return [...new Set(cities)];
}

// ------------------------------------
// SEARCH LOCATION
// ------------------------------------

export async function searchLocation(
  input: string,
  radiusMiles: string,
): Promise<LocationSearchResult> {
  const { latitude, longitude, displayName } = await getCoordinates(input);

  const cities = await getNearbyCities(latitude, longitude, radiusMiles);

  return {
    cities,
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

  // nearest postcode for display
  const reverseRes = await fetch(
    `https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}`,
  );

  const reverseData = await reverseRes.json();

  const postcode = reverseData.result?.[0]?.postcode || "Current Location";

  const cities = await getNearbyCities(latitude, longitude, radiusMiles);

  return {
    cities,
    postcode,
  };
}
