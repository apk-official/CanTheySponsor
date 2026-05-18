import React, { useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";
import { TypeRatingFilterProps, TypeRating } from "@/types";
import { InputGroupAddon } from "./ui/input-group";

const TypeRatingData: { key: string; value: TypeRating }[] = [
  { key: "TR1", value: "All" },
  { key: "TR2", value: "Temporary Worker (A (Premium))" },
  { key: "TR3", value: "Temporary Worker (A (SME+))" },
  { key: "TR4", value: "Temporary Worker (A rating)" },
  { key: "TR5", value: "Temporary Worker (B rating)" },
  { key: "TR6", value: "Worker (A (Premium))" },
  { key: "TR7", value: "Worker (A (SME+))" },
  { key: "TR8", value: "Worker (A rating)" },
  { key: "TR9", value: "Worker (B rating)" },
  { key: "TR10", value: "Worker (UK Expansion Worker: Provisional )" },
];

export default function TypeRatingFilter({value,onValueChange}:TypeRatingFilterProps) {
    const [open, setOpen] = useState<boolean>(false);
    const inputRef = React.useRef<HTMLInputElement>(null)
    const handleValueChange = (val: string | null, eventDetails: any) => {
    onValueChange((val ?? "All") as TypeRating)
    if (eventDetails.reason === 'item-press') {
      inputRef.current?.blur()
    }
  }
  return (
    <Combobox
          items={TypeRatingData}
          defaultValue={"All"}
          open={open}
          onOpenChange={setOpen}
          value={value}
          onValueChange={handleValueChange}
        >
          <ComboboxInput
            placeholder="Type/Rating"
            showClear={value !== "All"}
            readOnly
            ref={inputRef}
            className={`w-43 truncate text-ellipsis rounded-lg focus:border-none placeholder:text-primary py-5 font-sans text-xs cursor-pointer text-primary hover:text-primary aria-expanded:text-primary ${!open && value !== "All" ? ("border border-primary outline outline-primary"):""}`}
            
          ><InputGroupAddon className={undefined}>
              <span>Type/Rating: </span>
            </InputGroupAddon></ComboboxInput>
          <ComboboxContent className="w-full" anchor={undefined}>
            <ComboboxEmpty className={undefined}>No items found.</ComboboxEmpty>
            <ComboboxList className={undefined}>
              {(item: (typeof TypeRatingData)[number]) => (
                <ComboboxItem key={item.key} value={item.value} className={`data-highlighted:bg-primary-accent-mid data-highlighted:text-foreground font-sans focus:cursor-pointer ${value===item.value && ("text-primary")}`}>
                  {item.value}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>)
}
