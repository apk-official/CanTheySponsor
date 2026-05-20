/**
 * download.ts
 *
 * Three download strategies:
 *  1. downloadAsCSV   — filtered data → CSV blob → anchor click
 *  2. downloadAsPDF   — filtered data → jsPDF table → save
 *  3. downloadFullRegister — direct link to the raw public CSV file
 *
 * jsPDF and jspdf-autotable are dynamically imported so their ~300 kB bundle
 * is only fetched when the user actually clicks "PDF" — not on initial load.
 */

import type { Sponsor } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Hoisted outside functions so the array is not re-allocated on every call. */
const CSV_HEADERS: ReadonlyArray<keyof Sponsor> = [
  "Organisation Name",
  "Town/City",
  "Type & Rating",
  "Route",
];

// ─── CSV ──────────────────────────────────────────────────────────────────────

export function downloadAsCSV(data: Sponsor[], filename: string): void {
  const rows = data.map((row) =>
    CSV_HEADERS.map((h) => {
      const value = row[h] ?? "";
      // RFC 4180: fields containing commas, quotes, or newlines must be quoted.
      return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(","),
  );

  const csv = [CSV_HEADERS.join(","), ...rows].join("\n");
  triggerDownload(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

// ─── Full register ─────────────────────────────────────────────────────────────

export function downloadFullRegister(): void {
  const link = document.createElement("a");
  link.href = `${window.location.origin}/data/sponsors.csv`;
  link.download = "uk-sponsor-register-full.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

export async function downloadAsPDF(
  data: Sponsor[],
  filename: string,
): Promise<void> {
  // Dynamic imports keep these heavy libraries out of the initial bundle.
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
    body: data.map((row) => CSV_HEADERS.map((h) => row[h] ?? "")),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: {
      fillColor: [91, 61, 245],
      textColor: 255,
      fontStyle: "bold",
    },
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

// ─── Internal helper ──────────────────────────────────────────────────────────

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
  // Revoke after a tick so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
