import React from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Locate } from "lucide-react";

export default function PostcodeInput() {
  return (
    <form className="w-full">
      <FieldGroup className="gap-1">
        <Field className={undefined}>
          <input
            type="text"
            placeholder="Postcode(eg.NE4 1AG)"
            className="w-full py-3 px-3.5 border-none outline-none"
          />
        </Field>

        <Separator className={undefined} />
        <Field className={undefined}>
          <ToggleGroup
            type="single"
            size="sm"
            defaultValue="top"
            variant="outline"
            className="w-full flex-wrap pt-2"
            spacing={2}
          >
            <span>
              <p>Within: </p>
            </span>
            <ToggleGroupItem value="top" aria-label="Toggle top" className="">
              5 mi
            </ToggleGroupItem>
            <ToggleGroupItem
              value="bottom"
              aria-label="Toggle bottom"
              className={undefined}
            >
              10 mi
            </ToggleGroupItem>
            <ToggleGroupItem value="left" aria-label="Toggle left" className="">
              25 mi
            </ToggleGroupItem>
            <ToggleGroupItem
              value="right"
              aria-label="Toggle right"
              className=""
            >
              50 mi
            </ToggleGroupItem>
            <ToggleGroupItem
              value="right"
              aria-label="Toggle right"
              className=""
            >
              100 mi
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>
        <Field className="flex flex-row w-full pt-3">
          <button className="px-3 py-2 bg-primary rounded-md text-xs text-background cursor-pointer hover:bg-primary/90">Search</button>
          <button className="px-3 py-2 hover:bg-background bg-popover border border-border rounded-md text-xs cursor-pointer flex items-center justify-center gap-1 "><Locate strokeWidth={1} size={16} />Use My Location</button>
        </Field>
      </FieldGroup>
    </form>
  );
}
