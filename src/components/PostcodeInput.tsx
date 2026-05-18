import React, { useState } from "react";
import {
  Field,
  FieldGroup,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Separator } from "./ui/separator";
import { Loader2, Locate } from "lucide-react";
import { LocationFilterProps } from "@/types";

const radiusMap: Record<string, number> = {
  "5": 8047,
  "10": 16093,
  "25": 40234,
  "50": 80467,
  "100": 160934,
};

// Detects if input looks like a UK postcode
const isPostcode = (val: string) =>
  /^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i.test(val.trim());

const isOutcode = (val: string) =>
  /^[a-z]{1,2}\d[a-z\d]?$/i.test(val.trim());

const radius: { key: string; value: string }[] = [
  { key: "Rd1", value: "5" },
  { key: "Rd2", value: "10" },
  { key: "Rd3", value: "25" },
  { key: "Rd4", value: "50" },
  { key: "Rd5", value: "100" },
];
function getDistanceMetres(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
async function getCitiesFromLatLng(
  latitude: number,
  longitude: number,
  locationRadius: string
): Promise<string[]> {
  const radiusMiles = parseInt(locationRadius);
  const radiusMetres = radiusMiles * 1609.34;

  // Use ONS geometry-based spatial query — filter districts whose centroid
  // falls within the radius directly on the server side
  const url = new URL(
    "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/LAD_DEC_2023_UK_NC/FeatureServer/0/query"
  );

  url.searchParams.set("geometry", `${longitude},${latitude}`);
  url.searchParams.set("geometryType", "esriGeometryPoint");
  url.searchParams.set("inSR", "4326");
  url.searchParams.set("spatialRel", "esriSpatialRelIntersects");
  url.searchParams.set("distance", String(radiusMetres));
  url.searchParams.set("units", "esriSRUnit_Meter");
  url.searchParams.set("outFields", "LAD23NM,LAT,LONG");
  url.searchParams.set("returnGeometry", "false");
  url.searchParams.set("f", "json");
  url.searchParams.set("resultRecordCount", "500");

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!data.features?.length) return [];

  // Secondary filter — measure exact distance from searched point
  // to each district centroid to ensure strict radius compliance
  return data.features
    .filter((feature: any) => {
      const lat = feature.attributes.LAT;
      const lon = feature.attributes.LONG;
      if (!lat || !lon) return false;
      const distMetres = getDistanceMetres(latitude, longitude, lat, lon);
      return distMetres / 1609.34 <= radiusMiles;
    })
    .map((feature: any) => feature.attributes.LAD23NM as string)
    .filter(Boolean);
}
export default function PostcodeInput({
  value,
  onValueChange,
  locationRadius,
  onLocationRadiusChange,
  onHandleSelect,
  onCitiesChange,
}: LocationFilterProps) {
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingMyLocation, setLoadingMyLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
  if (!onCitiesChange) return;
  setError(null);
  setLoadingSearch(true);

  try {
    if (isPostcode(value)) {
      // Full postcode flow — get lat/lng first, then outcodes
      const geoRes = await fetch(
        `https://api.postcodes.io/postcodes/${value.replace(/\s/g, "")}`
      );
      const geoData = await geoRes.json();

      if (geoData.status !== 200) {
        setError("Invalid postcode. Please try again.");
        setLoadingSearch(false);
        return;
      }

      const { latitude, longitude } = geoData.result;
      const cities = await getCitiesFromLatLng(latitude, longitude, locationRadius);

      if (!cities.length) {
        setError("No locations found within that radius.");
        setLoadingSearch(false);
        return;
      }

      onCitiesChange(cities);

    } else if (isOutcode(value)) {
      // Outcode flow — look up outcode directly for its lat/lng
      const outcodeRes = await fetch(
        `https://api.postcodes.io/outcodes/${value.trim().toUpperCase()}`
      );
      const outcodeData = await outcodeRes.json();

      if (outcodeData.status !== 200) {
        setError("Invalid postcode. Please try again.");
        setLoadingSearch(false);
        return;
      }

      const { latitude, longitude } = outcodeData.result;
      const cities = await getCitiesFromLatLng(latitude, longitude, locationRadius);

      if (!cities.length) {
        setError("No locations found within that radius.");
        setLoadingSearch(false);
        return;
      }

      onCitiesChange(cities);

    } else {
      // City name flow — pass directly for string matching
      onCitiesChange([value.trim()]);
    }

    onHandleSelect?.();
  } catch (e) {
    setError("Something went wrong. Please try again.");
    console.error(e);
  } finally {
    setLoadingSearch(false);
  }
};

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingMyLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get nearest postcode for display
          const reverseRes = await fetch(
            `https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}`
          );
          const reverseData = await reverseRes.json();

          if (reverseData.status !== 200 || !reverseData.result?.length) {
            setError("Could not find your location.");
            setLoadingMyLocation(false);
            return;
          }

          const nearestPostcode = reverseData.result[0].postcode;
          onValueChange(nearestPostcode);

          // Get cities within radius using outcodes
          const cities = await getCitiesFromLatLng(latitude, longitude, locationRadius);

          if (!cities.length) {
            setError("No locations found within that radius.");
            setLoadingMyLocation(false);
            return;
          }

          onCitiesChange?.(cities);
          onHandleSelect?.();
        } catch (e) {
          setError("Something went wrong. Please try again.");
          console.error(e);
        } finally {
          setLoadingMyLocation(false);
        }
      },
      (err) => {
        const messages: Record<number, string> = {
      1: "Location access denied. Please allow location access in your browser settings.",
      2: "Location unavailable. Please try again.",
      3: "Location request timed out. Please try again.",
    };
    setError(messages[err.code] || "Could not get your location.");
    setLoadingMyLocation(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <form className="w-full">
      <FieldGroup className="gap-1">
        <Field className={undefined}>
          <input
            type="text"
            placeholder="Postcode/City (eg.NE4 1AG / London)"
            className="w-full py-3 px-3.5 border-none outline-none"
            value={value}
            onChange={(e) => onValueChange(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""))}
          />
        </Field>

        <Separator className={undefined} />
        <Field className={undefined}>
          <ToggleGroup
            type="single"
            size="sm"
            defaultValue="5"
            value={locationRadius}
            onValueChange={onLocationRadiusChange}
            variant="outline"
            className="w-full flex-wrap pt-2"
            spacing={2}
          >
            <span>
              <p>Within: </p>
            </span>
            {radius.map((radii) => (
              <ToggleGroupItem
                value={radii.value}
                key={radii.key}
                aria-label="Toggle five-mile"
                className="aria-pressed:bg-transparent aria-pressed:border-primary data-[state=on]:bg-transparent data-[state=on]:border-primary cursor-pointer"
              >
                {radii.value} mi
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        
        <Field className="flex flex-row w-full pt-3">
          <button
            type="button"
            disabled={value.length < 3}
            onClick={handleSearch}
            className="px-3 py-2 bg-primary rounded-md text-xs text-background cursor-pointer hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed 
             disabled:pointer-events-none"
          >
            {loadingSearch && <Loader2 size={12} className="animate-spin" />}
            Search
          </button>
          <button type="button" onClick={handleUseMyLocation} className="px-3 py-2 hover:bg-background bg-popover border border-border rounded-md text-xs cursor-pointer flex items-center justify-center gap-1 ">
            <Locate strokeWidth={1} size={16} />
            {loadingMyLocation && <Loader2 size={12} className="animate-spin" />}
            Use My Location
          </button>
        </Field>
        {error && (
          <p className="pt-3 text-xs text-destructive px-1">{error}</p>
        )}
      </FieldGroup>
    </form>
  );
}
