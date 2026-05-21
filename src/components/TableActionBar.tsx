/**
 * TableActionBar.tsx
 *
 * Sits between the filters and the table. Shows the data freshness date,
 * a highlight toggle (when a search term is active), and the download menu.
 *
 * FIX: "Updated On" date was hardcoded as "9th May 2026". It is now an
 * optional `updatedOn` prop. If omitted, it falls back to the hardcoded
 * value so no callsites break. In production this should be injected at
 * build time via Vite's `define` or read from the CSV metadata.
 */

import { Button } from "./ui/button";
import type { TableActionBarProps } from "@/types";
import { cn } from "@/lib/utils";
import { Highlighter } from "lucide-react";
import Export from "./Export";
import React from "react";

export default function TableActionBar({
  searchTerm,
  highlightEnabled,
  onHighlightToggle,
  filteredData,
  updatedOn = "9th May 2026",
  isFiltered,
}: TableActionBarProps) {
  return (
    <div className="w-full flex items-center justify-between pt-3 pb-2">
      <p className="font-mono text-xs font-normal text-muted-foreground">
        Updated On: {updatedOn}
      </p>

      <div className="flex items-center justify-center gap-2">
        {searchTerm.trim() && (
          <Button
            variant={highlightEnabled ? "ghost" : "outline"}
            className={cn(
              "cursor-pointer text-xs gap-2 rounded-md",
              highlightEnabled
                ? "border border-primary text-primary bg-primary-accent hover:bg-primary-accent hover:text-primary"
                : "text-muted-foreground hover:text-primary hover:bg-primary-accent",
            )}
            onClick={onHighlightToggle}
            aria-pressed={highlightEnabled}
            aria-label="Toggle search term highlighting"
          >
            <Highlighter
              strokeWidth={1}
              color={highlightEnabled ? "#7c5cff" : "#8e8e95"}
            />
            <span className="hidden sm:inline">Highlight</span>
          </Button>
        )}
        <Export filteredData={filteredData} isFiltered={isFiltered}/>
      </div>
    </div>
  );
}