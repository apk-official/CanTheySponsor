import { useState } from "react";
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
  onIsFilteredChange,
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

  const isFiltered =
    companySearch.trim() !== "" ||
    currentRoute !== "All" ||
    currentTypeRating !== "All" ||
    locationCities.length > 0;

  onFilteredDataChange(data);
  onLoadingChange(isLoading);
  onIsFilteredChange?.(isFiltered);

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

        <div className="flex items-center gap-3">
          <RouteFilter value={currentRoute} onValueChange={setCurrentRoute} />
          <TypeRatingFilter
            value={currentTypeRating}
            onValueChange={setCurrentTypeRating}
          />
        </div>

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