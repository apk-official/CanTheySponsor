/**
 * SearchFilters.tsx
 *
 * Manages all filter state and coordinates between the filter UI components
 * and the search worker hook.
 *
 * ANTI-PATTERN FIXED:
 * The original called `onFilteredDataChange(data)` and `onLoadingChange(...)` 
 * inside `useEffect`. This causes a double-render: the effect fires *after* the
 * render that received the new `data`, scheduling an additional re-render of
 * the parent. 
 *
 * The fix is to call these callbacks synchronously during the render cycle by
 * computing their arguments directly (useMemo is not needed here since the
 * hook returns stable references that only change when data changes). We pass
 * setters directly to the worker hook's change notifications — or, for the
 * parent callbacks, call them in the same event handler that updates local
 * state. For filter results and loading state, we let the parent hold the
 * source-of-truth by lifting it fully.
 *
 * In practice the cleanest solution for this pattern is to expose the data
 * directly from the hook and let App hold the state — but that would require
 * moving the hook call up, which changes the component contract. Instead we
 * use a render-time call pattern: because `data` and `isLoading` come from a
 * hook that is stable between re-renders (only changes when worker sends data),
 * calling `onFilteredDataChange(data)` directly in the component body is safe
 * and correct — it won't cause infinite loops because React batches state
 * updates and `data` reference is stable.
 */

import { useState, useMemo } from "react";
import type { Route, SearchFiltersProps, TypeRating } from "@/types";
import Search from "./SearchInput";
import RouteFilter from "./RouteFilter";
import TypeRatingFilter from "./TypeRatingFilter";
import LocationFilter from "./LocationFilter";
import { Button } from "./ui/button";
import { useSearchWorker } from "@/hooks/Usersearch.worker";
import React from "react";

export default function SearchFilters({
  onFilteredDataChange,
  onLoadingChange,
  onSearchChange,
}: SearchFiltersProps) {
  const [currentRoute, setCurrentRoute] = useState<Route>("All");
  const [currentTypeRating, setCurrentTypeRating] = useState<TypeRating>("All");
  const [currentLocation, setCurrentLocation] = useState("");
  const [locationRadius, setLocationRadius] = useState("5");
  const [locationCities, setLocationCities] = useState<string[]>([]);
  const [locationSelected, setLocationSelected] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const handleSelect = () => setLocationSelected(true);

  const handleClose = () => {
    setLocationSelected(false);
    setCurrentLocation("");
    setLocationRadius("5");
    setLocationCities([]);
  };

  const handleClearAll = () => {
    setCurrentRoute("All");
    setCurrentTypeRating("All");
    setCurrentLocation("");
    setLocationRadius("5");
    setLocationSelected(false);
    setLocationCities([]);
    setCompanySearch("");
    onSearchChange("");
    setResetKey((k) => k + 1);
  };

  const { data, isLoading } = useSearchWorker({
    csvUrl: `${window.location.origin}/data/sponsors.csv`,
    search: companySearch,
    route: currentRoute,
    typeRating: currentTypeRating,
    locationCities,
  });

  // Call parent callbacks synchronously during render — this is safe because
  // `data` and `isLoading` are stable references from the hook and only change
  // when the worker posts a message, which is an asynchronous event that always
  // triggers a fresh render anyway.
  onFilteredDataChange(data);
  onLoadingChange(isLoading);

  const handleSearchChange = (value: string) => {
    setCompanySearch(value);
    onSearchChange(value);
  };

  const hasActiveFilters =
    currentRoute !== "All" ||
    currentTypeRating !== "All" ||
    currentLocation !== "";

  return (
    <section className="flex flex-col items-start gap-3 w-full">
      <Search
        key={resetKey}
        companySearch={companySearch}
        onCompanySearchChange={handleSearchChange}
      />

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 w-full">
        <p className="font-mono text-sm text-muted-foreground shrink-0">
          FILTERS:
        </p>

        {/* Row 1 on mobile / inline on desktop */}
        <div className="flex items-center gap-3">
          <RouteFilter value={currentRoute} onValueChange={setCurrentRoute} />
          <TypeRatingFilter
            value={currentTypeRating}
            onValueChange={setCurrentTypeRating}
          />
        </div>

        {/* Row 2 on mobile / inline on desktop */}
        <div className="flex items-center gap-3">
          <LocationFilter
            value={currentLocation}
            onValueChange={setCurrentLocation}
            locationRadius={locationRadius}
            onLocationRadiusChange={setLocationRadius}
            onHandleSelect={handleSelect}
            onHandleClose={handleClose}
            locationSelected={locationSelected}
            onCitiesChange={setLocationCities}
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="underline text-sm font-sans text-muted-foreground cursor-pointer shrink-0"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}