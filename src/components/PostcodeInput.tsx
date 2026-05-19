import React, { useState } from "react";
import { Field, FieldGroup } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Separator } from "./ui/separator";
import { Loader2, Locate } from "lucide-react";
import { LocationFilterProps } from "@/types";
import { searchCurrentLocation, searchLocation } from "@/lib/location";
import { useMutation } from "@tanstack/react-query";

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
  const [error, setError] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: () => searchLocation(value, locationRadius),
    onSuccess: (result) => {
      if (!result.cities.length) {
        setError("No locations found.");
        return;
      }
      setError(null);
      onCitiesChange?.(result.cities);
      onHandleSelect?.();
    },
    onError: (err: any) => {
      setError(err.message || "Something went wrong.");
    },
  });

  const myLocationMutation = useMutation({
    mutationFn: () => searchCurrentLocation(locationRadius),
    onSuccess: (result) => {
      setError(null);
      onValueChange(result.postcode);
      onCitiesChange?.(result.cities);
      onHandleSelect?.();
    },
    onError: (err: any) => {
      const geolocationErrors: Record<number, string> = {
        1: "Location access denied.",
        2: "Location unavailable.",
        3: "Location request timed out.",
      };
      setError(
        err.code
          ? geolocationErrors[err.code] || "Could not get your location."
          : err.message || "Something went wrong.",
      );
    },
  });

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
            disabled={value.length < 3 || searchMutation.isPending}
            onClick={() => {
              setError(null);
              searchMutation.mutate();
            }}
            className="px-3 py-2 bg-primary rounded-md text-xs text-background cursor-pointer hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed 
             disabled:pointer-events-none flex items-center justify-center gap-1"
          >
            {searchMutation.isPending ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
          <button
            type="button"
            disabled={myLocationMutation.isPending}
            onClick={() => {
              setError(null);
              myLocationMutation.mutate();
            }}
            className="px-3 py-2 hover:bg-background bg-popover border border-border rounded-md text-xs cursor-pointer flex items-center justify-center gap-1 "
          >
            {myLocationMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Locating...
              </>
            ) : (
              <>
                <Locate strokeWidth={1} size={16} /> Use My Location
              </>
            )}
          </button>
        </Field>
        {error && <p className="pt-3 text-xs text-destructive px-1">{error}</p>}
      </FieldGroup>
    </form>
  );
}
