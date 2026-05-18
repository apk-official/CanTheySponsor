import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ChevronDown, CircleX } from "lucide-react";
import PostcodeInput from "./PostcodeInput";
import { LocationFilterProps } from "@/types";

export default function LocationFilter({
  value,
  onValueChange,
  locationRadius,
  onLocationRadiusChange,
  locationSelected,
  onHandleSelect,
  onHandleClose,
  onCitiesChange,
}: LocationFilterProps) {
  

  return (
    <div
      className={`flex items-center justify-center gap-3 px-1.5 py-2 border ${locationSelected ? "border-primary" : "border-border"} rounded-lg bg-popover`}
    >
      <span className="text-sm font-sans text-muted-foreground font-medium">
        Location{" "}
      </span>
      {locationSelected ? (
        <div className="flex items-center justify-center gap-1">
          <p className="text-primary font-sans text-sm w-30 truncate text-ellipsis py-1 px-1.5">
            {value} .{locationRadius} mil
          </p>
          <button type="button" onClick={onHandleClose} className="cursor-pointer">
            <CircleX strokeWidth={1} size={16} color="#7c5cff" />
          </button>
        </div>
      ) : (
        <Popover className="w-full">
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-6 w-6 p-0 rounded-sm">
              <ChevronDown strokeWidth={1} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-85">
            <PostcodeInput
              value={value}
              onValueChange={onValueChange}
              locationRadius={locationRadius}
              onLocationRadiusChange={onLocationRadiusChange}
                onHandleSelect={onHandleSelect}
                onCitiesChange={onCitiesChange}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
