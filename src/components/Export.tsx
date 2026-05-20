import React, { useState } from "react";
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

interface ExportProps {
  filteredData: Sponsor[];
}

export default function Export({ filteredData }: ExportProps) {
  // Track which item is loading so we can show a spinner on just that item
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleDownload = async (key: string) => {
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

  const downloadMenu = [
    {
      key: "DM1",
      value: "Download filtered data",
      type: "CSV",
      type_color: "var(--chart-2)",
      icon: (
        <FileChartColumnIncreasing strokeWidth={1} size={25} color="var(--chart-2)" />
      ),
    },
    {
      key: "DM2",
      value: "Download filtered data",
      type: "PDF",
      type_color: "var(--destructive)",
      icon: <FileText strokeWidth={1} color="var(--destructive)" />,
    },
    {
      key: "DM3",
      value: "Download full register",
      type: "CSV",
      type_color: "var(--chart-3)",
      icon: <FileSpreadsheet strokeWidth={1} color="var(--chart-3)" />,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center justify-center rounded-md text-xs cursor-pointer hover:bg-primary/90 hover:text-foreground"
          variant={"default"}
        >
          Download <ChevronDown strokeWidth={1} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 flex flex-col gap-1">
        {downloadMenu.map((item) => (
          <DropdownMenuItem
            key={item.key}
            className="group flex items-center justify-between gap-3 cursor-pointer data-highlighted:bg-primary/10"
            inset={undefined}
            onSelect={(e: Event) => {
              // Prevent dropdown closing while PDF is generating
              if (item.key === "DM2") e.preventDefault();
              handleDownload(item.key);
            }}
          >
            <div className="p-2 flex items-center justify-center bg-primary-accent group-data-highlighted:bg-primary-accent-mid rounded-md">
              {loadingKey === item.key ? (
                <Loader2 size={16} className="animate-spin text-muted-foreground" />
              ) : (
                item.icon
              )}
            </div>
            <div className="flex flex-col items-start justify-center flex-1">
              <p className="text-xs font-mono font-medium text-foreground">
                {item.value}
              </p>
              <p className="text-xs font-mono font-light text-muted-foreground">
                Format:<span style={{ color: item.type_color }}> {item.type}</span>
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}