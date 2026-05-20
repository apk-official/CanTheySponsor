/**
 * Navbar.tsx
 *
 * Top navigation bar with branding and theme toggle.
 *
 * FIXES:
 * - Removed the `"sperator"` typo className (no effect, but dead code).
 * - Fixed `text-forground` → `text-foreground` (was silently ignored by Tailwind).
 */

import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "./ui/separator";
import { Handshake } from "lucide-react";
import React from "react";

export default function Navbar() {
  return (
    <>
      <div className="flex items-center justify-between w-full h-12">
        <div className="font-sans text-lg text-foreground flex gap-2 items-center">
          <Handshake strokeWidth={0.75} color={"#7C5CFF"} />
          <p>CanTheySponsor</p>
        </div>
        <ThemeToggle />
      </div>
      <Separator className=""/>
    </>
  );
}