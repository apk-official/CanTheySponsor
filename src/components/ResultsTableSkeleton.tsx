import React from "react";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
const COLUMNS = 4;
const ROW_COUNT = 2;

export default function ResultsTableSkeleton() {
  return (
    <Card className="mt-4 w-full border border-border rounded-2xl overflow-hidden min-h-96 px-2 bg-background">
      <CardContent className="w-full flex flex-col items-between gap-4">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          {Array.from({ length: COLUMNS }).map((_, i) => (
            <Skeleton key={i} className="w-30 h-8" />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: ROW_COUNT }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center justify-between w-full">
            {Array.from({ length: COLUMNS }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="w-30 h-4 rounded-full" />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


