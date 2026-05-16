import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "./ui/separator";
import { Handshake } from "lucide-react";

export default function Navbar() {
  return (
    <>
      <div className="flex items-center justify-between w-full h-12">
        <div className="font-sans text-lg text-forground flex gap-2 items-center">
          <Handshake strokeWidth={0.75} color={"#7C5CFF"}/>
          <p>CanTheySponsor</p>
        </div>
        <ThemeToggle />
      </div>
      <Separator className="sperator" />
    </>
  );
}
