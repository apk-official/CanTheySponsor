import React, { useEffect, useMemo, useState } from "react";
import { Route, SearchFiltersProps, Sponsor, TypeRating } from "@/types";
import Search from "./SearchInput";
import RouteFilter from "./RouteFilter";
import TypeRatingFilter from "./TypeRatingFilter";
import LocationFilter from "./LocationFilter";
import { Button } from "./ui/button";
import Papa from "papaparse";

export default function SearchFilters({ onFilteredDataChange, onLoadingChange }: SearchFiltersProps) {
  const [currentRoute, setCurrentRoute] = useState<Route>("All");
  const [currentTypeRating, setCurrentTypeRating] = useState<TypeRating>("All");
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [locationRadius, setLocationRadius] = useState<string>("5");
  const [locationSelected, setLocationSelected] = useState<boolean>(false);
  const [companySearch, setCompanySearch] = useState<string>("");
  const [data, setData] = useState<Sponsor[]>([]);
  const handleSelect = () => {
    setLocationSelected((prev) => !prev);
  };
  const handleClose = () => {
    setLocationSelected(false);
    setCurrentLocation("");
    setLocationRadius("5");
  };
  const handleClearAll = () => {
    setCurrentRoute("All");
    setCurrentTypeRating("All");
    setCurrentLocation("");
    setLocationRadius("5");
    setLocationSelected(false);
  };
  
  useEffect(() => {
    onLoadingChange(true);
    Papa.parse("/data/sponsors.csv", {
      header: true,
      download: true,
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

    return matchesSearch && matchesRoute && matchesTypeRating;
    });
  }, [data, companySearch, currentRoute, currentTypeRating]);

      // call onFilteredDataChange whenever filteredData changes
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
