import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import LocationTabs from "./LocationTabs";

export default function LocationFilter() {
  return (
    <div className="flex items-center justify-center gap-3 px-1.5 py-2 border border-border rounded-lg bg-popover">
      <span className="text-sm font-sans text-muted-foreground font-medium">
        Location{" "}
      </span>
      <Popover classsName="w-full">
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-6 w-6 p-0 rounded-sm">
            <ChevronDown strokeWidth={1} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-85">
          <LocationTabs />
        </PopoverContent>
      </Popover>
    </div>
  );
}
