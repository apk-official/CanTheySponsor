import React, { useState } from "react";
import { Field, FieldGroup } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Separator } from "./ui/separator";
import { Loader2, Locate } from "lucide-react";
import { LocationFilterProps } from "@/types";
import { searchCurrentLocation, searchLocation } from "@/lib/location";

const radius: { key: string; value: string }[] = [
  { key: "Rd1", value: "5" },
  { key: "Rd2", value: "10" },
  { key: "Rd3", value: "25" },
  { key: "Rd4", value: "50" },
  { key: "Rd5", value: "100" },
];

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
    setError(null);
    setLoadingSearch(true);
    try {
      const result = await searchLocation(value, locationRadius);
      if (!result.cities.length) {
        setError("No locations found.");
        return;
      }
      onCitiesChange?.(result.cities);
      onHandleSelect?.();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingSearch(false);
    }
  };
  // -----------------------------
  // MY LOCATION
  // -----------------------------

  const handleUseMyLocation = async () => {
    try {
      setError(null);
      setLoadingMyLocation(true);

      const result = await searchCurrentLocation(locationRadius);

      onValueChange(result.postcode);

      onCitiesChange?.(result.cities);

      onHandleSelect?.();
    } catch (err: any) {
      const geolocationErrors: Record<number, string> = {
        1: "Location access denied.",
        2: "Location unavailable.",
        3: "Location request timed out.",
      };

      if (err.code) {
        setError(geolocationErrors[err.code] || "Could not get your location.");
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setLoadingMyLocation(false);
    }
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
            onChange={(e) =>
              onValueChange(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""))
            }
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
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="px-3 py-2 hover:bg-background bg-popover border border-border rounded-md text-xs cursor-pointer flex items-center justify-center gap-1 "
          >
            <Locate strokeWidth={1} size={16} />
            {loadingMyLocation && (
              <Loader2 size={12} className="animate-spin" />
            )}
            Use My Location
          </button>
        </Field>
        {error && <p className="pt-3 text-xs text-destructive px-1">{error}</p>}
      </FieldGroup>
    </form>
  );
}
