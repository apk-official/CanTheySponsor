import React from "react";
import { Button } from "./ui/button";
import { TableActionBarProps } from "@/types";
import { cn } from "@/lib/utils";
import { Download, Highlighter } from "lucide-react";

export default function TableActionBar({
  searchTerm,
  highlightEnabled,
  onHighlightToggle,
}: TableActionBarProps) {
  return (
    <div className="w-full flex items-center justify-between pt-3 pb-2">
      <p className="font-mono text-xs font-normal text-muted-foreground">
        Updated On:9th May 2026
      </p>
      <div className="flex items-center justify-center gap-2">

        {searchTerm.trim() && (
          <Button
            variant={highlightEnabled ? "ghost" : "outline"}
            className={cn(
              "cursor-pointer text-xs gap-2 rounded-md",
              highlightEnabled
                ? "border border-primary text-primary bg-primary-accent hover:bg-primary-accent hover:text-primary"
                : "text-muted-foreground hover:text-primary hover:bg-primary-accent"
            )}
            onClick={onHighlightToggle}
          >
            <Highlighter
              strokeWidth={1}
              color={highlightEnabled ? "#7c5cff" : "#8e8e95"}
            />
            {/* Hide label on mobile, show on sm+ */}
            <span className="hidden sm:inline">Highlight</span>
          </Button>
        )}

        <Button className="flex items-center justify-center rounded-md text-xs cursor-pointer hover:bg-primary/90 hover:text-foreground" variant={"default"}><Download strokeWidth={1} />Download CSV</Button>
      </div>
    </div>
  );
}