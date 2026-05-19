import React, { useRef } from "react";
import emptyState from "@/assets/empty.svg";
import { ResultsTableProps } from "@/types";
import ResultsTableSkeleton from "./ResultsTableSkeleton";
import { useVirtualizer } from "@tanstack/react-virtual";
import { highlightMatch } from "@/lib/highlight";

export default function ResultsTable({
  data,
  isLoading,
  searchTerm,
  highlightEnabled,
}: ResultsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  if (isLoading) return <ResultsTableSkeleton />;

  return (
    <div className="mt-4 w-full border border-border rounded-2xl overflow-hidden min-h-96">

      {/* Empty state is OUTSIDE the scrollable container so it centers
          relative to the full component width on mobile, not the min-w
          table content width. */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <img src={emptyState} alt="No results" className="mx-auto w-32 opacity-50 mb-2" />
          <p className="text-sm font-semibold text-foreground font-sans">No sponsors found.</p>
          <p className="text-xs text-muted-foreground font-mono">Try adjusting your filters.</p>
        </div>
      ) : (
        /* Horizontal scroll wrapper — only present when there is data.
           Header and body share the same min-w container so they scroll together. */
        <div className="overflow-x-auto">
          <div className="min-w-175">

            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 border-b border-border">
              <span className="font-sans text-sm text-muted-foreground">Organisation Name</span>
              <span className="font-sans text-sm text-muted-foreground">Town/City</span>
              <span className="font-sans text-sm text-muted-foreground">Type & Rating</span>
              <span className="font-sans text-sm text-muted-foreground text-right">Route</span>
            </div>

            {/* Virtualised body — vertical scroll only, horizontal handled above */}
            <div ref={parentRef} className="overflow-y-auto overflow-x-hidden h-150 custom-scrollbar">
              <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const row = data[virtualRow.index];

                  const organisationName =
                    highlightEnabled && searchTerm.trim()
                      ? highlightMatch(row["Organisation Name"], searchTerm)
                      : row["Organisation Name"];

                  return (
                    <div
                      key={virtualRow.index}
                      style={{
                        position: "absolute",
                        top: `${virtualRow.start}px`,
                        left: 0,
                        right: 0,
                        height: `${virtualRow.size}px`,
                      }}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 items-start border-b border-border hover:bg-muted/50"
                    >
                      <span className="font-sans text-sm pr-4 wrap-break-word">
                        {organisationName}
                      </span>
                      <span className="font-sans text-sm truncate pr-4">{row["Town/City"]}</span>
                      <span className="font-sans text-sm truncate pr-4">{row["Type & Rating"]}</span>
                      <span className="font-sans text-sm text-right truncate">{row["Route"]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}