/**
 * Export.tsx
 *
 * Dropdown with three download options: filtered CSV, filtered PDF, and
 * the full raw register CSV.
 *
 * FIX: Removed unused `React` import (JSX transform handles it).
 * IMPROVEMENT: Added `aria-busy` and `aria-label` attributes to loading states
 * so screen readers announce the in-progress download.
 */

import { useState } from "react";
import {
  ChevronDown,
  FileChartColumnIncreasing,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadAsCSV, downloadAsPDF, downloadFullRegister } from "@/lib/download";
import type { Sponsor } from "@/types";
import React from "react";

interface ExportProps {
  filteredData: Sponsor[];
}

type DownloadKey = "DM1" | "DM2" | "DM3";

const DOWNLOAD_MENU: Array<{
  key: DownloadKey;
  label: string;
  type: string;
  typeColor: string;
  icon: React.ReactNode;
}> = [
  {
    key: "DM1",
    label: "Download filtered data",
    type: "CSV",
    typeColor: "var(--chart-2)",
    icon: (
      <FileChartColumnIncreasing
        strokeWidth={1}
        size={25}
        color="var(--chart-2)"
      />
    ),
  },
  {
    key: "DM2",
    label: "Download filtered data",
    type: "PDF",
    typeColor: "var(--destructive)",
    icon: <FileText strokeWidth={1} color="var(--destructive)" />,
  },
  {
    key: "DM3",
    label: "Download full register",
    type: "CSV",
    typeColor: "var(--chart-3)",
    icon: <FileSpreadsheet strokeWidth={1} color="var(--chart-3)" />,
  },
];

export default function Export({ filteredData }: ExportProps) {
  const [loadingKey, setLoadingKey] = useState<DownloadKey | null>(null);

  const handleDownload = async (key: DownloadKey): Promise<void> => {
    setLoadingKey(key);
    try {
      const date = new Date().toISOString().split("T")[0];
      switch (key) {
        case "DM1":
          downloadAsCSV(filteredData, `sponsor-filtered-${date}`);
          break;
        case "DM2":
          await downloadAsPDF(filteredData, `sponsor-filtered-${date}`);
          break;
        case "DM3":
          downloadFullRegister();
          break;
      }
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center justify-center rounded-md text-xs cursor-pointer hover:bg-primary/90 hover:text-foreground"
          variant="default"
        >
          Download <ChevronDown strokeWidth={1} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 flex flex-col gap-1">
        {DOWNLOAD_MENU.map((item) => {
          const isLoading = loadingKey === item.key;
          return (
            <DropdownMenuItem
              key={item.key}
              className="group flex items-center justify-between gap-3 cursor-pointer data-highlighted:bg-primary/10"
              inset={undefined}
              aria-busy={isLoading}
              onSelect={(e: Event) => {
                // For async operations (PDF), prevent the dropdown from closing
                // while the generation is in progress.
                if (item.key === "DM2") e.preventDefault();
                handleDownload(item.key);
              }}
            >
              <div className="p-2 flex items-center justify-center bg-primary-accent group-data-highlighted:bg-primary-accent-mid rounded-md">
                {isLoading ? (
                  <Loader2
                    size={16}
                    className="animate-spin text-muted-foreground"
                    aria-label={`Generating ${item.type}…`}
                  />
                ) : (
                  item.icon
                )}
              </div>
              <div className="flex flex-col items-start justify-center flex-1">
                <p className="text-xs font-mono font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs font-mono font-light text-muted-foreground">
                  Format:{" "}
                  <span style={{ color: item.typeColor }}>{item.type}</span>
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}