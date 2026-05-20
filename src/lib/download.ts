/**
 * download.ts
 *
 * Utility functions for downloading data as CSV or PDF.
 */

import type { Sponsor } from "@/types";

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

export function downloadAsCSV(data: Sponsor[], filename: string): void {
  const headers = ["Organisation Name", "Town/City", "Type & Rating", "Route"];

  const rows = data.map((row) =>
    headers
      .map((h) => {
        const value = row[h as keyof Sponsor] ?? "";
        return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
      })
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");
  triggerDownload(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function downloadFullRegister(): void {
  const link = document.createElement("a");
  link.href = `${window.location.origin}/data/sponsors.csv`;
  link.download = "uk-sponsor-register-full.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ---------------------------------------------------------------------------
// PDF — uses @react-pdf/renderer, dynamically imported so the library
// (~300kb) is only loaded when the user actually clicks PDF download.
// ---------------------------------------------------------------------------

export async function downloadAsPDF(
  data: Sponsor[],
  filename: string,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(12);
  doc.text("UK Home Office — Licensed Sponsor Register", 14, 15);
  doc.setFontSize(8);
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-GB")} · cantheysponsor.com`,
    14,
    21,
  );

  autoTable(doc, {
    startY: 26,
    head: [["Organisation Name", "Town/City", "Type & Rating", "Route"]],
    body: data.map((row) => [
      row["Organisation Name"],
      row["Town/City"],
      row["Type & Rating"],
      row["Route"],
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [91, 61, 245], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 247] },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 50 },
      2: { cellWidth: 70 },
      3: { cellWidth: 60 },
    },
  });

  doc.save(`${filename}.pdf`);
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function triggerDownload(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
