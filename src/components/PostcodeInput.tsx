import React from "react";
import {
  Field,
  FieldGroup,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Separator } from "./ui/separator";
import { Locate } from "lucide-react";
import { LocationFilterProps } from "@/types";

const radius: { key: string; value: string }[] = [
  { key: "Rd1", value: "5" },
  { key: "Rd2", value: "10" },
  { key: "Rd3", value: "25" },
  { key: "Rd4", value: "50" },
  { key: "Rd5", value: "100" },
];
export default function PostcodeInput({
  value,
  onValueChange,
  locationRadius,
  onLocationRadiusChange,
  onHandleSelect,
}: LocationFilterProps) {
  return (
    <form className="w-full">
      <FieldGroup className="gap-1">
        <Field className={undefined}>
          <input
            type="text"
            placeholder="Postcode/City (eg.NE4 1AG / London)"
            className="w-full py-3 px-3.5 border-none outline-none"
            value={value}
            onChange={(e) => onValueChange(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""))}
          />
        </Field>

        <Separator className={undefined} />
        <Field className={undefined}>
          <ToggleGroup
            type="single"
            size="sm"
            defaultValue="5"
            value={locationRadius}
            onValueChange={onLocationRadiusChange}
            variant="outline"
            className="w-full flex-wrap pt-2"
            spacing={2}
          >
            <span>
              <p>Within: </p>
            </span>
            {radius.map((radii) => (
              <ToggleGroupItem
                value={radii.value}
                key={radii.key}
                aria-label="Toggle five-mile"
                className="aria-pressed:bg-transparent aria-pressed:border-primary data-[state=on]:bg-transparent data-[state=on]:border-primary cursor-pointer"
              >
                {radii.value} mi
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Field className="flex flex-row w-full pt-3">
          <button
            type="button"
            disabled={value.length < 3}
            onClick={onHandleSelect}
            className="px-3 py-2 bg-primary rounded-md text-xs text-background cursor-pointer hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed 
             disabled:pointer-events-none"
          >
            Search
          </button>
          <button className="px-3 py-2 hover:bg-background bg-popover border border-border rounded-md text-xs cursor-pointer flex items-center justify-center gap-1 ">
            <Locate strokeWidth={1} size={16} />
            Use My Location
          </button>
        </Field>
      </FieldGroup>
    </form>
  );
}
