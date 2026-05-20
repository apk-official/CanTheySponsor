/**
 * PostcodeInput.tsx
 *
 * Input form inside the location filter popover. Accepts a postcode, outcode,
 * or city name and a radius toggle, then resolves nearby towns via the APIs
 * in lib/location.ts.
 *
 * FIXES:
 * - Error state now resets at the *start* of a mutation (not only on success),
 *   so stale errors from a previous failed search are cleared immediately when
 *   the user initiates a new one.
 * - Removed the redundant `setError(null)` calls at the click handler level
 *   (they were duplicating the reset already done in `onMutate`).
 */

import { useState } from "react";
import { Field, FieldGroup } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Separator } from "./ui/separator";
import { Loader2, Locate } from "lucide-react";
import type { LocationFilterProps } from "@/types";
import { searchCurrentLocation, searchLocation } from "@/lib/location";
import { useMutation } from "@tanstack/react-query";
import React from "react";

const RADIUS_OPTIONS: { key: string; value: string }[] = [
  { key: "Rd1", value: "5" },
  { key: "Rd2", value: "10" },
  { key: "Rd3", value: "25" },
  { key: "Rd4", value: "50" },
  { key: "Rd5", value: "100" },
];

const GEO_ERROR_MESSAGES: Record<number, string> = {
  1: "Location access denied.",
  2: "Location unavailable.",
  3: "Location request timed out.",
};

export default function PostcodeInput({
  value,
  onValueChange,
  locationRadius,
  onLocationRadiusChange,
  onHandleSelect,
  onCitiesChange,
}: LocationFilterProps) {
  const [error, setError] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: () => searchLocation(value, locationRadius),
    // Reset error at the start so stale errors disappear immediately.
    onMutate: () => setError(null),
    onSuccess: (result) => {
      if (!result.cities.length) {
        setError("No locations found.");
        return;
      }
      onCitiesChange?.(result.cities);
      onHandleSelect?.();
    },
    onError: (err: Error) => {
      setError(err.message || "Something went wrong.");
    },
  });

  const myLocationMutation = useMutation({
    mutationFn: () => searchCurrentLocation(locationRadius),
    onMutate: () => setError(null),
    onSuccess: (result) => {
      onValueChange(result.postcode);
      onCitiesChange?.(result.cities);
      onHandleSelect?.();
    },
    onError: (err: GeolocationPositionError & Error) => {
      setError(
        err.code
          ? (GEO_ERROR_MESSAGES[err.code] ?? "Could not get your location.")
          : (err.message || "Something went wrong."),
      );
    },
  });

  const isPending =
    searchMutation.isPending || myLocationMutation.isPending;

  return (
    <form className="w-full" onSubmit={(e) => e.preventDefault()}>
      <FieldGroup className="gap-1">
        <Field className={undefined}>
          <input
            type="text"
            placeholder="Postcode/City (e.g. NE4 1AG / London)"
            className="w-full py-3 px-3.5 border-none outline-none"
            value={value}
            onChange={(e) =>
              onValueChange(
                e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""),
              )
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
              <p>Within:</p>
            </span>
            {RADIUS_OPTIONS.map((r) => (
              <ToggleGroupItem
                key={r.key}
                value={r.value}
                aria-label={`Within ${r.value} miles`}
                className="aria-pressed:bg-transparent aria-pressed:border-primary data-[state=on]:bg-transparent data-[state=on]:border-primary cursor-pointer"
              >
                {r.value} mi
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        <Field className="flex flex-row w-full pt-3">
          <button
            type="submit"
            disabled={value.length < 3 || isPending}
            onClick={() => searchMutation.mutate()}
            className="px-3 py-2 bg-primary rounded-md text-xs text-background cursor-pointer hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center gap-1"
          >
            {searchMutation.isPending ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => myLocationMutation.mutate()}
            className="px-3 py-2 hover:bg-background bg-popover border border-border rounded-md text-xs cursor-pointer flex items-center justify-center gap-1"
          >
            {myLocationMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Locating...
              </>
            ) : (
              <>
                <Locate strokeWidth={1} size={16} />
                Use My Location
              </>
            )}
          </button>
        </Field>

        {error && (
          <p role="alert" className="pt-3 text-xs text-destructive px-1">
            {error}
          </p>
        )}
      </FieldGroup>
    </form>
  );
}