import React, { useEffect, useState } from "react";
import { Route, SearchFiltersProps, TypeRating } from "@/types";
import Search from "./SearchInput";
import RouteFilter from "./RouteFilter";
import TypeRatingFilter from "./TypeRatingFilter";
import LocationFilter from "./LocationFilter";
import { Button } from "./ui/button";
import { useSearchWorker } from "@/hooks/Usersearch.worker";

export default function SearchFilters({
  onFilteredDataChange,
  onLoadingChange,
  onSearchChange,
}: SearchFiltersProps) {
  const [currentRoute, setCurrentRoute] = useState<Route>("All");
  const [currentTypeRating, setCurrentTypeRating] = useState<TypeRating>("All");
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [locationRadius, setLocationRadius] = useState<string>("5");
  const [locationCities, setLocationCities] = useState<string[]>([]);
  const [locationSelected, setLocationSelected] = useState<boolean>(false);
  const [companySearch, setCompanySearch] = useState<string>("");
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

  const handleSearchChange = (value: string) => {
    setCompanySearch(value);
    onSearchChange(value);
  };

  useEffect(() => {
    onFilteredDataChange(data);
  }, [data]);

  useEffect(() => {
    onLoadingChange(isLoading);
  }, [isLoading]);

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

      {/* On mobile: two rows. On desktop (md+): single row with all filters */}
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
