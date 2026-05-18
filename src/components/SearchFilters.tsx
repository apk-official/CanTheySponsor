import React, { useState } from "react";
import { Route, TypeRating } from "@/types";
import Search from "./SearchInput";
import RouteFilter from "./RouteFilter";
import TypeRatingFilter from "./TypeRatingFilter";
import LocationFilter from "./LocationFilter";
import { Button } from "./ui/button";

export default function SearchFilters() {
  const [currentRoute, setCurrentRoute] = useState<Route>("All");
  const [currentTypeRating, setCurrentTypeRating] = useState<TypeRating>("All");
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [locationRadius, setLocationRadius] = useState<string>("5");
  const [locationSelected, setLocationSelected] = useState<boolean>(false);
  const [companySearch, setCompanySearch] = useState<string>("");
    const handleSelect = () => {
    setLocationSelected((prev) => !prev);
  };
  const handleClose = () => {
    setLocationSelected(false);
    setCurrentLocation("");
    setLocationRadius("5")
  };
  const handleClearAll = () => {
    setCurrentRoute("All");
    setCurrentTypeRating("All");
    setCurrentLocation("");
    setLocationRadius("5");
    setLocationSelected(false);
  }
  return (
    <section className="flex flex-col items-start justify-between gap-3">
      <Search companySearch={companySearch} onCompanySearchChange={setCompanySearch } />
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
