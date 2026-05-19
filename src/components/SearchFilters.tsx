import React, { useEffect, useMemo, useState } from "react";
import { Route, SearchFiltersProps, Sponsor, TypeRating } from "@/types";
import Search from "./SearchInput";
import RouteFilter from "./RouteFilter";
import TypeRatingFilter from "./TypeRatingFilter";
import LocationFilter from "./LocationFilter";
import { Button } from "./ui/button";
import Papa from "papaparse";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "");

export default function SearchFilters({
  onFilteredDataChange,
  onLoadingChange,
}: SearchFiltersProps) {
  const [currentRoute, setCurrentRoute] = useState<Route>("All");
  const [currentTypeRating, setCurrentTypeRating] = useState<TypeRating>("All");
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [locationRadius, setLocationRadius] = useState<string>("5");
  const [locationCities, setLocationCities] = useState<string[]>([]);
  const [locationSelected, setLocationSelected] = useState<boolean>(false);
  const [companySearch, setCompanySearch] = useState<string>("");
  const [data, setData] = useState<Sponsor[]>([]);

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
  };

  useEffect(() => {
    onLoadingChange(true);
    Papa.parse("/data/sponsors.csv", {
      header: true,
      download: true,
      worker:true,
      complete: (results) => {
        setData(results.data as Sponsor[]);
        onLoadingChange(false);
      },
    });
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (!row["Organisation Name"]) return false;

      const matchesSearch = row["Organisation Name"]
        .toLowerCase()
        .includes(companySearch.toLowerCase());

      const matchesRoute =
        currentRoute === "All" || row["Route"]?.trim() === currentRoute;

      const matchesTypeRating =
        currentTypeRating === "All" ||
        row["Type & Rating"]?.trim() === currentTypeRating;

      const matchesLocation =
        locationCities.length === 0 ||
        locationCities.some((city) => {
          const normCity = normalize(city);
          const normRow = normalize(row["Town/City"] ?? "");
          return normRow.includes(normCity) || normCity.includes(normRow);
        });

      return (
        matchesSearch && matchesRoute && matchesTypeRating && matchesLocation
      );
    });
  }, [data, companySearch, currentRoute, currentTypeRating, locationCities]);

  useEffect(() => {
    onFilteredDataChange(filteredData);
  }, [filteredData]);
  return (
    <section className="flex flex-col items-start justify-between gap-3">
      <Search
        companySearch={companySearch}
        onCompanySearchChange={setCompanySearch}
      />
      <div className="flex items-center justify-start gap-3 flex-wrap w-full">
        <p className="font-mono text-sm text-muted-foreground">FILTERS: </p>
        <RouteFilter value={currentRoute} onValueChange={setCurrentRoute} />
        <TypeRatingFilter
          value={currentTypeRating}
          onValueChange={setCurrentTypeRating}
        />
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
        {(currentRoute !== "All" ||
          currentTypeRating !== "All" ||
          currentLocation !== "") && (
          <Button
            variant={"ghost"}
            onClick={handleClearAll}
            className="underline text-sm font-sans text-muted-foreground cursor-pointer"
          >
            Clear All
          </Button>
        )}
      </div>
    </section>
  );
}
