/**
 * RouteFilter.tsx
 *
 * Combobox dropdown for filtering by visa route.
 * The combobox is read-only (no free-text input) — the user picks from a
 * predefined list of routes that match the CSV values exactly.
 */

import { useRef, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";
import type { Route, RouteFilterProps } from "@/types";
import { InputGroupAddon } from "./ui/input-group";
import React from "react";

const ROUTE_OPTIONS: { key: string; value: Route }[] = [
  { key: "R1", value: "All" },
  { key: "R2", value: "Charity Worker" },
  { key: "R3", value: "Creative Worker" },
  { key: "R4", value: "Global Business Mobility: Graduate Trainee" },
  { key: "R5", value: "Global Business Mobility: Secondment Worker" },
  { key: "R6", value: "Global Business Mobility: Senior or Specialist Worker" },
  { key: "R7", value: "Global Business Mobility: Service Supplier" },
  { key: "R8", value: "Global Business Mobility: UK Expansion Worker" },
  { key: "R9", value: "Government Authorised Exchange" },
  { key: "R10", value: "International Agreement" },
  { key: "R11", value: "International Sportsperson" },
  { key: "R12", value: "Intra Company Transfers (ICT)" },
  { key: "R13", value: "Intra-company Routes" },
  { key: "R14", value: "Religious Worker" },
  { key: "R15", value: "Scale-up" },
  { key: "R16", value: "Seasonal Worker" },
  { key: "R17", value: "Skilled Worker" },
  { key: "R18", value: "Tier 2 Ministers of Religion" },
];

export default function RouteFilter({ value, onValueChange }: RouteFilterProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleValueChange = (val: string | null, eventDetails: { reason: string }) => {
    onValueChange((val ?? "All") as Route);
    // Close the dropdown keyboard-focus when an item is pressed so the popover
    // doesn't stay open after selection on keyboard navigation.
    if (eventDetails.reason === "item-press") {
      inputRef.current?.blur();
    }
  };

  return (
    <Combobox
      items={ROUTE_OPTIONS}
      defaultValue="All"
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={handleValueChange}
    >
      <ComboboxInput
        placeholder="Route"
        showClear={value !== "All"}
        readOnly
        ref={inputRef}
        className={`w-43 truncate text-ellipsis rounded-lg focus:border-none placeholder:text-primary py-5 font-sans text-xs cursor-pointer text-primary hover:text-primary aria-expanded:text-primary ${
          !open && value !== "All" ? "border border-primary outline outline-primary" : ""
        }`}
      >
        <InputGroupAddon className={undefined}>
          <span>Route: </span>
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent className="w-full" anchor={undefined}>
        <ComboboxEmpty className={undefined}>No items found.</ComboboxEmpty>
        <ComboboxList className={undefined}>
          {(item: (typeof ROUTE_OPTIONS)[number]) => (
            <ComboboxItem
              key={item.key}
              value={item.value}
              className={`data-highlighted:bg-primary-accent-mid data-highlighted:text-foreground font-sans focus:cursor-pointer ${
                value === item.value ? "text-primary" : ""
              }`}
            >
              {item.value}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}