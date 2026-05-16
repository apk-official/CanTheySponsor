import React, { useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";
import { Route, RouteFilterProps } from "@/types";
import { InputGroupAddon } from "./ui/input-group";

const RouteData: { key: string; value: Route }[] = [
  { key: "R1", value: "All" },
  { key: "R2", value: "Workers" },
  { key: "R3", value: "Temporary Workers" },
];

export default function RouteFilter({
  value,
  onValueChange,
}: RouteFilterProps) {
  const [open, setOpen] = useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null)
  const handleValueChange = (val: string | null, eventDetails: any) => {
  onValueChange((val ?? "All") as Route)
  if (eventDetails.reason === 'item-press') {
    inputRef.current?.blur()
  }
}
  return (
    <Combobox
      items={RouteData}
      defaultValue={"All"}
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
        className={`w-43 truncate text-ellipsis rounded-lg focus:border-none placeholder:text-primary py-5 font-sans text-xs cursor-pointer text-primary hover:text-primary aria-expanded:text-primary ${!open && value !== "All" ? ("border border-primary outline outline-primary"):""}`}
        
      ><InputGroupAddon className={undefined}>
          <span>Route: </span>
        </InputGroupAddon></ComboboxInput>
      <ComboboxContent className="w-full" anchor={undefined}>
        <ComboboxEmpty className={undefined}>No items found.</ComboboxEmpty>
        <ComboboxList className={undefined}>
          {(item: (typeof RouteData)[number]) => (
            <ComboboxItem key={item.key} value={item.value} className={`data-highlighted:bg-primary-accent-mid data-highlighted:text-foreground font-sans focus:cursor-pointer ${value===item.value && ("text-primary")}`}>
              {item.value}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
