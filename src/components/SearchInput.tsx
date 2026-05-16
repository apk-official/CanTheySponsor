import React from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Search } from "lucide-react";

export default function SearchInput() {
  return (
    <div className="w-full p-[1.5px] rounded-lg bg-border focus-within:bg-linear-to-r focus-within:from-primary focus-within:to-transparent">
      <div className="w-full rounded-[calc(var(--radius-lg)-1.5px)] bg-background">
        <InputGroup className="w-full h-15 px-4.5 border-0">
          <InputGroupInput name="sponsor-company-search" className="h-15" placeholder="Type a Company Name..."/>
          <InputGroupAddon className="">
            <Search strokeWidth={1} size={20} color="#7c5cff" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
